import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import ChatCloseButton from "./ChatCloseButton";

const API_URL = "http://localhost:5000/api";

// Configuración de Speech Recognition con idioma en inglés
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  console.log("SpeechRecognition está disponible");
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
}

const ChatScreen = () => {
  const { topic } = useLocation().state || {};

  if (!topic) {
    return <p>No se proporcionaron datos del tópico.</p>;
  }

  const [chatLog, setChatLog] = useState([]);
  const [listening, setListening] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [previousConversation, setPreviousConversation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [decisionMade, setDecisionMade] = useState(false); // Nuevo estado para controlar la decisión
  const welcomeMessageAdded = useRef(false);

  // Obtener conversación previa
  useEffect(() => {
    const fetchPreviousConversation = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/last-conversation`, {
          params: { topic },
        });
        if (
          response.data &&
          response.data.conversation &&
          response.data.conversation.length > 0
        ) {
          setPreviousConversation(response.data.conversation);
          setShowModal(true);
        } else {
          // Si no hay conversación previa, marcamos la decisión como tomada para seguir el flujo
          setDecisionMade(true);
        }
      } catch (error) {
        console.error("Error al cargar la conversación previa:", error);
      }
    };

    fetchPreviousConversation();
  }, [topic]);

  // Funciones para manejar la decisión del modal
  const handleContinueConversation = () => {
    setChatLog(previousConversation);
    setShowModal(false);
    setDecisionMade(true);
    // Inyectar un saludo de "bienvenida de vuelta"
    const welcomeBack = `Welcome back! Ready to continue talking about "${topic}"?`;
    // Agregar el saludo al chat y reproducirlo en audio
    setChatLog(prevLog => [...prevLog, { sender: "bot", message: welcomeBack }]);
    playText(welcomeBack);
  };
  

  const handleNewConversation = () => {
    setChatLog([]);
    setShowModal(false);
    setDecisionMade(true); // Se marca la decisión
  };

  // Guardar conversación en la base de datos
  const handleSaveConversation = async () => {
    try {
      await axios.post(`${API_URL}/chat/save-conversation`, {
        conversation: chatLog,
        topic,
      });
      alert("Conversación guardada exitosamente.");
      window.location.href = "/topic-selection";
    } catch (error) {
      console.error("Error al guardar la conversación:", error);
      alert("No se pudo guardar la conversación.");
      throw error;
    }
  };

  // Reproducir texto en audio
  const playText = (text) => {
    if (!("speechSynthesis" in window)) {
      console.error("Este navegador no soporta síntesis de voz.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Manejo del reconocimiento de voz
  const toggleListening = () => {
    if (!recognition) {
      console.log("El reconocimiento de voz no es compatible con este navegador.");
      return;
    }
    if (!listening) {
      console.log("Iniciando reconocimiento de voz...");
      recognition.start();
      setListening(true);
      setTranscriptBuffer("");
    } else {
      console.log("Deteniendo reconocimiento de voz...");
      recognition.stop();
      setListening(false);
      processTranscript();
    }
  };

  const processTranscript = () => {
    if (transcriptBuffer) {
      console.log("Procesando transcripción del buffer:", transcriptBuffer);
      setChatLog((prevLog) => [
        ...prevLog,
        { sender: "user", message: transcriptBuffer.trim() },
      ]);
      sendMessageToBot(transcriptBuffer.trim());
      setTranscriptBuffer("");
    }
  };

  // Enviar mensaje al bot
  const sendMessageToBot = async (message) => {
    try {
      const payload = {
        message,
        topic,
        userLevel: "A1",
        isInitialMessage: chatLog.length === 0,
        chatHistory: chatLog,
      };

      console.log("Datos enviados al backend:", payload);

      const response = await axios.post(`${API_URL}/chat`, payload);
      const botReply = response.data.botMessage;

      if (
        chatLog.length > 0 &&
        chatLog[chatLog.length - 1].message === botReply
      ) {
        console.warn("Respuesta repetitiva detectada. Ignorando...");
        return;
      }

      // Si es el primer mensaje y se inicia una nueva conversación, el bot saluda
      if (chatLog.length === 0) {
        const welcome = `Welcome! Are you ready to talk about "${topic}"?`;
        setChatLog((prevLog) => [
          ...prevLog,
          { sender: "bot", message: welcome },
        ]);
        playText(welcome);
      }

      setChatLog((prevLog) => [
        ...prevLog,
        { sender: "bot", message: botReply },
      ]);
      playText(botReply);
    } catch (error) {
      console.error("Error enviando mensaje al bot:", error);
    }
  };

  // Configuración del reconocimiento de voz
  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (const result of event.results) {
          if (result.isFinal) {
            finalTranscript += result[0].transcript.trim() + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscriptBuffer(finalTranscript.trim());
        }
        console.log("Resultados parciales (interim):", interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Error en SpeechRecognition:", event.error);
      };

      recognition.onend = () => {
        console.log("Reconocimiento de voz detenido.");
        if (listening) {
          recognition.start();
        }
      };
    }
  }, [listening]);

  // Obtener saludo de bienvenida solo después de que se haya tomado la decisión
  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/welcome`, {
          params: { topic, level: "A1" },
        });
        const message = response.data.botMessage;

        if (chatLog.length === 0 && !welcomeMessageAdded.current) {
          setChatLog((prevLog) => [
            ...prevLog,
            { sender: "bot", message },
          ]);
          playText(message);
          welcomeMessageAdded.current = true;
        }
      } catch (error) {
        console.error("Error obteniendo el saludo inicial:", error);
      }
    };

    if (decisionMade && chatLog.length === 0) {
      fetchWelcomeMessage();
    }
  }, [topic, chatLog, decisionMade]);

  return (
    <div>
      <h1>Chat Screen</h1>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Conversación previa encontrada</h2>
            <p>
              ¿Deseas continuar la conversación anterior o iniciar una nueva?
            </p>
            <div className="modal-buttons">
              <button onClick={handleContinueConversation}>
                Continuar
              </button>
              <button onClick={handleNewConversation}>
                Nueva conversación
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-log">
        {chatLog.map((entry, index) => (
          <p
            key={index}
            className={entry.sender === "user" ? "user-message" : "bot-message"}
          >
            <strong>{entry.sender === "user" ? "Alumno: " : "Bot: "}</strong>
            {entry.message}
          </p>
        ))}
      </div>

      <ChatCloseButton
        conversationData={chatLog}
        onReturnHome={handleSaveConversation}
      />

      <button onClick={toggleListening}>
        {listening ? "Detener" : "Hablar"}
      </button>
    </div>
  );
};

export default ChatScreen;
