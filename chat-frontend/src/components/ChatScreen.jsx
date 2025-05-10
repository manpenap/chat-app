import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import ChatCloseButton from "./ChatCloseButton";
import { fetchPreviousConversation, saveConversation, sendMessageToBot } from "../services/api";
import ChatLog from "./ChatLog";
import Modal from "./Modal";

const API_URL = "https://lets-talk-4ejt.onrender.com/api";

// Configuración de Speech Recognition con idioma en inglés
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
}

const ChatScreen = () => {
  const { topic } = useLocation().state || {};
  const navigate = useNavigate();

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
  const [translations, setTranslations] = useState({});

  const chatContainerRef = useRef(null);

  const handleTranslate = async (index, message) => {
    // Si ya se tradujo este mensaje, no hacemos nada (o podríamos implementar toggle)
    if (translations[index]) return;
    try {
      const response = await axios.get(
        "https://api.mymemory.translated.net/get",
        {
          params: {
            q: message,
            langpair: "en|es",
          },
        }
      );
      const translatedText = response.data.responseData.translatedText;
      setTranslations((prev) => ({ ...prev, [index]: translatedText }));
    } catch (error) {
      console.error("Error al traducir:", error);
    }
  };

  // Función para capitalizar la primera letra de cada oración
  const capitalizeSentences = (text) => {
    return text.replace(/(?:^|\.\s+|\?\s+|!\s+)([a-z])/g, (match, p1) =>
      match.replace(p1, p1.toUpperCase())
    );
  };

  // Obtener conversación previa
  useEffect(() => {
    const loadPreviousConversation = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetchPreviousConversation(topic, token);
        if (response.data && response.data.conversation?.length > 0) {
          setPreviousConversation(response.data.conversation);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error al cargar la conversación previa:", error);
      }
    };

    loadPreviousConversation();
  }, [topic]);

  // Funciones para manejar la decisión del modal
  const handleContinueConversation = () => {
    setShowModal(false);
    setDecisionMade(true);
    // Combinar la conversación previa con el saludo de bienvenida
    const welcomeBack = `Welcome back! Ready to continue talking about "${topic}"?`;
    const updatedLog = previousConversation
      ? [...previousConversation, { sender: "bot", message: welcomeBack }]
      : [{ sender: "bot", message: welcomeBack }];
    setChatLog(updatedLog);
    playText(welcomeBack);
  };

  // Efecto que se dispara cuando chatLog cambia y se ha tomado la decisión
  useEffect(() => {
    if (decisionMade && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatLog, decisionMade]);

  const handleNewConversation = () => {
    setChatLog([]);
    setShowModal(false);
    setDecisionMade(true); // Se marca la decisión
  };

  // Guardar conversación en la base de datos
  const handleSaveConversation = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await saveConversation(chatLog, topic, token);
      navigate("/topic-selection");
    } catch (error) {
      console.error("Error al guardar la conversación:", error);
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
      return;
    }
    if (!listening) {
      recognition.start();
      setListening(true);
      setTranscriptBuffer("");
    } else {
      recognition.stop();
      setListening(false);
      processTranscript();
    }
  };

  // Procesar el mensaje transcrito
  const processTranscript = () => {
    if (transcriptBuffer) {
      const formattedMessage = capitalizeSentences(transcriptBuffer.trim());
      setChatLog((prevLog) => [
        ...prevLog,
        { sender: "user", message: formattedMessage },
      ]);
      sendMessageToBotHandler(transcriptBuffer.trim());
      setTranscriptBuffer("");
    }
  };

  // Enviar mensaje al bot
  const sendMessageToBotHandler = async (message) => {
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        message,
        topic,
        userLevel: "A1",
        chatHistory: chatLog,
      };
      const response = await sendMessageToBot(payload, token);
      const botReply = response.data.botMessage;
      setChatLog((prevLog) => [...prevLog, { sender: "bot", message: botReply }]);
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
      };

      recognition.onerror = (event) => {
        console.error("Error en SpeechRecognition:", event.error);
      };

      recognition.onend = () => {
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
          setChatLog((prevLog) => [...prevLog, { sender: "bot", message }]);
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-start gap-4 px-5">
      <h1 className="text-3xl text-textSecondColor pt-12"> Let's Talk</h1>
      <div className="min-h-6">
        {listening && transcriptBuffer === "" && (
          <div className="flex items-center gap-2 text-yellow-300 animate-pulse">
            <span>🎙️ Escuchando...</span>
          </div>
        )}

        {transcriptBuffer !== "" && (
          <div className="flex items-center gap-2 text-green-400 animate-pulse">
            <span>✅ Pulsa "Detener" para enviar tu mensaje</span>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title="Conversación previa encontrada"
          description="¿Deseas continuar la conversación anterior o iniciar una nueva?"
          buttons={[
            {
              label: "Continuar",
              className:
                "w-1/3 text-sm bg-buttonColor text-white py-2 rounded hover:bg-buttonColorHover transition duration-200",
              onClick: handleContinueConversation,
            },
            {
              label: "Nueva conversación",
              className:
                "w-1/3 text-sm border border-buttonColor text-buttonColor py-2 rounded hover:bg-blue-50 transition duration-200",
              onClick: handleNewConversation,
            },
          ]}
          onClose={() => setShowModal(false)}
        />
      )}

      <div
        ref={chatContainerRef}
        className="chat-log text-textMainColor text-lg mb-32 max-w-lg w-full overflow-y-auto"
        style={{
          maxHeight: "70vh",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <ChatLog
          chatLog={chatLog}
          playText={playText}
          handleTranslate={handleTranslate}
          translations={translations}
        />
      </div>

      <div className="fixed bottom-0 w-full flex justify-center items-center gap-4 bg-backgroundAlternative py-4 px-5">
        <div>
          <ChatCloseButton
            conversationData={chatLog}
            onReturnHome={handleSaveConversation}
          />
        </div>

        <button
          className={`${
            showModal ? "hidden" : "block"
          } bg-buttonColor px-4 py-2 w-32 text-textMainColor rounded hover:bg-buttonColorHover transition duration-200 flex items-center justify-center gap-2 ${
            listening && transcriptBuffer === ""
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={toggleListening}
          disabled={listening && transcriptBuffer === ""}
        >
          {listening ? (
            <>
              
              Detener
            </>
          ) : (
            <>
            
              Hablar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
