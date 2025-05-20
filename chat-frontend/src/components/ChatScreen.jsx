import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useError } from "../context/ErrorContext";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { fetchPreviousConversation, fetchWelcomeMessage, sendMessageToBot, saveConversation, translateMessage } from "../services/api";

import ChatHeader from "./ChatHeader";
import ChatModal from "./ChatModal";
import ChatActions from "./ChatActions";
import ErrorBanner from "./ErrorBanner";
import ChatLog from "./ChatLog";
import { capitalizeSentences, playText } from "../utils/utils";

/**
 * ChatScreen
 * Componente principal de la pantalla de chat.
 * Gestiona el flujo de conversación, reconocimiento de voz, historial, modal de conversación previa y acciones del usuario.
 */
const ChatScreen = () => {
  // Obtiene el tema seleccionado desde la navegación
  const { topic } = useLocation().state || {};
  // Obtiene el token de autenticación y nivel de usuario del contexto
  const { authToken, userLevel } = useAuth();
  const navigate = useNavigate();
  const { error, showError, clearError } = useError();

  // Reconocimiento de voz
  const {
    listening,
    transcriptBuffer,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  /**
   * Estado principal de la conversación
   * @typedef {Object} ConversationState
   * @property {Array} chatLog - Historial de mensajes
   * @property {Array|null} previousConversation - Conversación previa si existe
   * @property {Object} translations - Traducciones de mensajes
   * @property {boolean} showModal - Si se muestra el modal de conversación previa
   * @property {boolean} decisionMade - Si el usuario ya tomó una decisión sobre la conversación previa
   */
  const [conversationState, setConversationState] = useState({
    chatLog: [],
    previousConversation: null,
    translations: {},
    showModal: false,
    decisionMade: false,
  });

  // Refs para controlar el saludo inicial y el scroll del chat
  const welcomeMessageAdded = useRef(false);
  const chatContainerRef = useRef(null);

  /**
   * Traduce un mensaje del bot y lo almacena en el estado.
   * @param {number} index - Índice del mensaje en el chatLog
   * @param {string} message - Mensaje a traducir
   */
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
      navigate("/topic-selection"); // Redirigir al usuario después de guardar
    } catch (error) {
      showError("Error al guardar la conversación.");
      console.error("Error al guardar la conversación:", error);
    }
  };

  // Procesar el mensaje transcrito
  const processTranscript = () => {
    if (transcriptBuffer) {
      const formattedMessage = capitalizeSentences(transcriptBuffer.trim());
      if (formattedMessage) {
        setConversationState((prevState) => ({
          ...prevState,
          chatLog: [
            ...prevState.chatLog,
            { sender: "user", message: formattedMessage },
          ],
        }));
        sendMessageToBotHandler(formattedMessage); // Usa el mensaje formateado
      }
    }
  };

  // Enviar mensaje al bot
  const sendMessageToBotHandler = async (message) => {
    try {
      const payload = {
        message,
        topic,
        userLevel,
        chatHistory: conversationState.chatLog,
      };
      const response = await sendMessageToBot(payload, authToken);

      console.log( response.data.wordCount);
      // Chequea el conteo de palabras recibido del backend
      if (response.data.wordCount !== undefined) {
        console.log("Palabras pronunciadas por el usuario:", response.data.wordCount);
      }

      let { botMessage, sessionEnded } = response.data; // Desestructurar la respuesta

      // Manejar el caso en que botMessage sea un objeto
      if (typeof botMessage === "object" && botMessage.botMessage) {
        botMessage = botMessage.botMessage; // Extraer el mensaje real
      }


      if (typeof botMessage === "string") {
        setConversationState((prevState) => ({
          ...prevState,
          chatLog: [
            ...prevState.chatLog,
            { sender: "bot", message: botMessage },
          ],
        }));
        playText(botMessage);

        // Manejar el caso en que la sesión haya terminado
        if (sessionEnded) {
          await handleSaveConversation(); // Guardar la conversación
          showError("La sesión ha finalizado. Gracias por practicar.");
        }
      } else {
        console.error("Invalid botReply format:", response.data);
      }
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
      <ChatHeader listening={listening} transcriptBuffer={transcriptBuffer} />
      <ChatModal
        showModal={conversationState.showModal}
        handleContinueConversation={handleContinueConversation}
        handleNewConversation={handleNewConversation}
        closeModal={() =>
          setConversationState((prevState) => ({
            ...prevState,
            showModal: false,
          }))
        }
      />
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
      <ChatActions
        chatLog={conversationState.chatLog}
        toggleListening={toggleListening}
        listening={listening}
        transcriptBuffer={transcriptBuffer}
        handleSaveConversation={handleSaveConversation}
        showModal={conversationState.showModal}
      />
      <ErrorBanner error={error} clearError={clearError} />
    </div>
  );
};

export default ChatScreen;
