import React from "react";
import ChatCloseButton from "./ChatCloseButton";

/**
 * ChatActions
 * Barra de acciones del chat: cerrar chat y controlar reconocimiento de voz.
 * @param {Object} props
 * @param {Array} props.chatLog - Historial de mensajes
 * @param {Function} props.toggleListening - Inicia/detiene reconocimiento de voz
 * @param {boolean} props.listening - Si el reconocimiento está activo
 * @param {string} props.transcriptBuffer - Texto transcrito actual
 * @param {Function} props.handleSaveConversation - Guarda la conversación
 * @param {boolean} props.showModal - Si el modal está visible
 */
const ChatActions = ({
  chatLog,
  toggleListening,
  listening,
  transcriptBuffer,
  handleSaveConversation,
  showModal,
}) => {
  return (
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
        {listening ? "Detener" : "Hablar"}
      </button>
    </div>
  );
};

export default ChatActions;