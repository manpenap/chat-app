import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useError } from "../context/ErrorContext";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

import ChatCloseButton from "./ChatCloseButton";
import {
  fetchPreviousConversation,
  saveConversation,
  sendMessageToBot,
  fetchWelcomeMessage,
  translateMessage,
} from "../services/api";
import ChatLog from "./ChatLog";
import Modal from "./Modal";
import { capitalizeSentences, playText } from "../utils/utils";

const API_URL = "https://lets-talk-4ejt.onrender.com/api";

const ChatScreen = () => {
  const { topic } = useLocation().state || {};
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const { error, showError, clearError } = useError();

  const {
    listening,
    transcriptBuffer,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  if (!topic) {
    return <p>No se proporcionaron datos del tópico.</p>;
  }

  const [conversationState, setConversationState] = useState({
    chatLog: [],
    previousConversation: null,
    translations: {},
    showModal: false,
    decisionMade: false,
  });

  const welcomeMessageAdded = useRef(false);
  const chatContainerRef = useRef(null);

  const handleTranslate = async (index, message) => {
    if (conversationState.translations[index]) return;
    try {
      const translatedText = await translateMessage(message);
      setConversationState((prevState) => ({
        ...prevState,
        translations: { ...prevState.translations, [index]: translatedText },
      }));
    } catch (error) {
      console.error("Error al traducir:", error);
    }
  };

  // Obtener conversación previa
  useEffect(() => {
    const loadPreviousConversation = async () => {
      try {
        const response = await fetchPreviousConversation(topic, authToken);
        if (response.data && response.data.conversation?.length > 0) {
          // Si hay conversaciones previas, muestra el modal
          setConversationState((prevState) => ({
            ...prevState,
            previousConversation: response.data.conversation,
            showModal: true,
          }));
        } else {
          // Si no hay conversaciones previas, activa directamente el flujo de saludo inicial
          setConversationState((prevState) => ({
            ...prevState,
            decisionMade: true,
          }));
        }
      } catch (error) {
        showError("Error al cargar la conversación previa.");
        console.error("Error al cargar la conversación previa:", error);
      }
    };

    loadPreviousConversation();
  }, [topic, authToken, showError]);

  // Funciones para manejar la decisión del modal
  const handleContinueConversation = () => {
    setConversationState((prev) => ({
      ...prev,
      showModal: false,
      decisionMade: true,
    }));
    const welcomeBack = `Welcome back! Ready to continue talking about "${topic}"?`;
    const updatedLog = conversationState.previousConversation
      ? [...conversationState.previousConversation, { sender: "bot", message: welcomeBack }]
      : [{ sender: "bot", message: welcomeBack }];
    setConversationState((prev) => ({
      ...prev,
      chatLog: updatedLog,
    }));
    playText(welcomeBack);
  };

  // Efecto que se dispara cuando chatLog cambia y se ha tomado la decisión
  useEffect(() => {
    if (conversationState.decisionMade && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversationState.chatLog, conversationState.decisionMade]);

  const handleNewConversation = () => {
    setConversationState((prev) => ({
      ...prev,
      chatLog: [],
      showModal: false,
      decisionMade: true,
    }));
    welcomeMessageAdded.current = false; // Reiniciar para permitir un nuevo saludo
  };

  // Guardar conversación en la base de datos
  const handleSaveConversation = async () => {
    try {
      await saveConversation(conversationState.chatLog, topic, authToken);
      navigate("/topic-selection");
    } catch (error) {
      showError("Error al guardar la conversación.");
      console.error("Error al guardar la conversación:", error);
    }
  };

  // Procesar el mensaje transcrito
  const processTranscript = () => {
    if (transcriptBuffer) {
      const formattedMessage = capitalizeSentences(transcriptBuffer.trim());
      setConversationState((prevState) => ({
        ...prevState,
        chatLog: [
          ...prevState.chatLog,
          { sender: "user", message: formattedMessage },
        ],
      }));
      sendMessageToBotHandler(transcriptBuffer.trim());
    }
  };

  // Enviar mensaje al bot
  const sendMessageToBotHandler = async (message) => {
    try {
      const payload = {
        message,
        topic,
        userLevel: "A1",
        chatHistory: conversationState.chatLog,
      };
      const response = await sendMessageToBot(payload, authToken);
      const botReply = response.data.botMessage;

      setConversationState((prevState) => ({
        ...prevState,
        chatLog: [
          ...prevState.chatLog,
          { sender: "bot", message: botReply },
        ],
      }));

      playText(botReply);
    } catch (error) {
      showError("Error enviando mensaje al bot.");
      console.error("Error enviando mensaje al bot:", error);
    }
  };

  // Obtener saludo de bienvenida solo después de que se haya tomado la decisión
  useEffect(() => {
    const fetchWelcomeMessageHandler = async () => {
      try {
        const response = await fetchWelcomeMessage(topic, "A1", authToken);
        const message = response.data.botMessage;

        if (conversationState.chatLog.length === 0 && !welcomeMessageAdded.current) {
          setConversationState((prevState) => ({
            ...prevState,
            chatLog: [
              ...prevState.chatLog,
              { sender: "bot", message },
            ],
          }));
          playText(message);
          welcomeMessageAdded.current = true; // Marcar que el saludo inicial ya fue agregado
        }
      } catch (error) {
        console.error("Error obteniendo el saludo inicial:", error);
      }
    };

    if (conversationState.decisionMade && conversationState.chatLog.length === 0) {
      fetchWelcomeMessageHandler();
    }
  }, [topic, conversationState.chatLog, conversationState.decisionMade, authToken]);

  const toggleListening = () => {
    if (listening) {
      stopListening(); // Detener el reconocimiento de voz
      processTranscript(); // Procesar el mensaje transcrito
    } else {
      startListening(); // Iniciar el reconocimiento de voz
    }
  };

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

      {conversationState.showModal && (
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
          onClose={() =>
            setConversationState((prevState) => ({
              ...prevState,
              showModal: false,
            }))
          }
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
          chatLog={conversationState.chatLog}
          playText={playText}
          handleTranslate={handleTranslate}
          translations={conversationState.translations}
        />
      </div>

      <div className="fixed bottom-0 w-full flex justify-center items-center gap-4 bg-backgroundAlternative py-4 px-5">
        <div>
          <ChatCloseButton
            conversationData={conversationState.chatLog}
            onReturnHome={handleSaveConversation}
          />
        </div>

        <button
          className={`${
            conversationState.showModal ? "hidden" : "block"
          } bg-buttonColor px-4 py-2 w-32 text-textMainColor rounded hover:bg-buttonColorHover transition duration-200 flex items-center justify-center gap-2 ${
            listening && transcriptBuffer === ""
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={toggleListening}
          disabled={listening && transcriptBuffer === ""}
        >
          {listening ? "Detener" : "Hablar"}
        </button>
      </div>

      {error && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-2 z-50">
          <p>{error}</p>
          <button
            onClick={clearError}
            className="absolute top-2 right-4 text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
