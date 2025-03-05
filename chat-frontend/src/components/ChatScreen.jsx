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
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const lastFinalTranscript = useRef("");
  const location = useLocation();
  const { lesson } = location.state || {};

  if (!lesson) {
    return <p>No se proporcionaron datos de la lección.</p>;
  }

  const audioPlayedRef = useRef(false);
  const welcomeMessageAdded = useRef(false);

  // Cargar conversación previa al iniciar el componente
  useEffect(() => {
    const fetchPreviousConversation = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/chat/last-conversation"
        );
        if (response.data && response.data.conversation) {
          setChatLog(response.data.conversation); // Cargar la conversación previa
        }
      } catch (error) {
        console.error("Error al cargar la conversación previa:", error);
      }
    };

    fetchPreviousConversation();
  }, []);

  // Guardar conversación en la base de datos
  const handleSaveConversation = async () => {
    try {
      await axios.post("http://localhost:5000/api/chat/save-conversation", {
        conversation: chatLog,
      });
      alert("Conversación guardada exitosamente.");
      window.location.href = "/home"; // Redirigir al Home
    } catch (error) {
      console.error("Error al guardar la conversación:", error);
      alert("No se pudo guardar la conversación.");
    }
  };

// Función para reproducir el texto en audio usando la API del navegador
const playText = (text) => {
  // Verificar si el navegador soporta síntesis de voz
  if (!("speechSynthesis" in window)) {
    console.error("Este navegador no soporta síntesis de voz.");
    return;
  }

  // Crear una instancia de SpeechSynthesisUtterance con el texto
  const utterance = new SpeechSynthesisUtterance(text);

  // Configurar el idioma, velocidad y tono
  utterance.lang = "en-US"; // Puedes ajustar según tus necesidades
  utterance.rate = 1;       // Velocidad normal
  utterance.pitch = 1;      // Tono normal

  // Reproducir el audio
  window.speechSynthesis.speak(utterance);
};


  // Configuración y manejo de reconocimiento de voz
  const toggleListening = () => {
    if (!recognition) {
      console.log(
        "El reconocimiento de voz no es compatible con este navegador."
      );
      return;
    }

    if (!listening) {
      console.log("Iniciando reconocimiento de voz...");
      recognition.start();
      setListening(true);
      setTranscriptBuffer(""); // Limpiar el buffer
    } else {
      console.log("Deteniendo reconocimiento de voz...");
      recognition.stop(); // Detener reconocimiento
      setListening(false);
      processTranscript(); // Procesar transcripción al detener
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
      setTranscriptBuffer(""); // Limpiar el buffer
    }
  };

  const sendMessageToBot = async (message) => {
    try {
      const lastMessage =
        chatLog.length > 0 ? chatLog[chatLog.length - 1].message : "";

      if (message === lastMessage) {
        console.warn("Mensaje duplicado detectado, no se enviará al bot.");
        return;
      }

      const payload = {
        message,
        isLesson: !!lesson,
        userLevel: "A1",
        lessonDetails: lesson
          ? {
              type: lesson.type,
              name: lesson.name,
              content: lesson.content?.text || "",
              unitObjective: lesson.unit_objective,
              pathLevel: lesson.pathLevel,
            }
          : null,
        isInitialMessage: chatLog.length === 0,
        chatHistory: chatLog,
      };

      console.log("Datos enviados al backend:", payload);

      const response = await axios.post(`${API_URL}/chat`, payload);
      const botReply = response.data.botMessage;

      // Verificar si la respuesta del bot es repetitiva
      if (
        chatLog.length > 0 &&
        chatLog[chatLog.length - 1].message === botReply
      ) {
        console.warn("Respuesta repetitiva detectada. Ignorando...");
        return;
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

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (const result of event.results) {
          if (result.isFinal) {
            const newTranscript = result[0].transcript.trim();
            if (!lastFinalTranscript.current.includes(newTranscript)) {
              finalTranscript += newTranscript + " ";
              lastFinalTranscript.current += newTranscript + " ";
            }
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Asegurar que incluso frases cortas se agreguen al buffer
        if (finalTranscript.trim()) {
          setTranscriptBuffer(
            (prevBuffer) => prevBuffer + finalTranscript.trim()
          );
        } else {
          console.warn("Se detectó un resultado final muy corto pero válido.");
        }

        console.log("Resultados parciales (interim):", interimTranscript);
      };

      const processTranscript = () => {
        const finalMessage =
          lastFinalTranscript.current.trim() || transcriptBuffer.trim();

        if (finalMessage) {
          console.log("Procesando transcripción válida:", finalMessage);

          setChatLog((prevLog) => [
            ...prevLog,
            { sender: "user", message: finalMessage },
          ]);

          sendMessageToBot(finalMessage);

          // Limpiar buffer y referencia después de procesar
          lastFinalTranscript.current = "";
          setTranscriptBuffer("");
        } else {
          console.warn(
            "No se encontró ninguna transcripción válida para procesar."
          );
        }
      };

      recognition.onerror = (event) => {
        console.error("Error en SpeechRecognition:", event.error);
      };

      recognition.onend = () => {
        console.log("Reconocimiento de voz detenido.");

        // Procesar datos pendientes antes de reiniciar
        if (lastFinalTranscript.current.trim() || transcriptBuffer.trim()) {
          console.log("Procesando datos pendientes antes de reiniciar.");
          processTranscript();
        }

        if (listening) {
          recognition.start(); // Reinicia si sigue activo
        }
      };
    }
  }, [listening]);

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/welcome`, {
          params: { level: "A1" },
        });
        const message = response.data.botMessage;

        // Agregar el saludo inicial al chat si no se ha añadido antes
        if (!welcomeMessageAdded.current) {
          setChatLog((prevLog) => [...prevLog, { sender: "bot", message }]);
          playText(message);
          welcomeMessageAdded.current = true; // Marcar como añadido
        }
      } catch (error) {
        console.error("Error obteniendo el saludo inicial:", error);
      }
    };

    fetchWelcomeMessage();
  }, []);

  return (
    <div>
      <h1>Chat Screen</h1>
      {console.log("Estado del chatLog:", chatLog)}
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
        conversationData={chatLog} // Pasar el historial actual al botón de cierre
        onReturnHome={handleSaveConversation} // Guardar y redirigir al Home
      />

      <button onClick={toggleListening}>
        {listening ? "Detener" : "Hablar"}
      </button>
    </div>
  );
};

export default ChatScreen;
