import React from "react";

/**
 * ChatHeader
 * Encabezado del chat, muestra el estado del reconocimiento de voz.
 * @param {Object} props
 * @param {boolean} props.listening - Si el reconocimiento de voz está activo
 * @param {string} props.transcriptBuffer - Texto transcrito actual
 */
const ChatHeader = ({ listening, transcriptBuffer }) => {
  return (
    <div>
      <h1 className="text-3xl text-textSecondColor pt-12">Let's Talk</h1>
      <div className="min-h-6">
        {listening && transcriptBuffer === "" && (
          <div className="flex items-center gap-2 text-yellow-300 animate-pulse">
            <span>🎙️ Escuchando...</span>
          </div>
        )}
        {listening && transcriptBuffer !== "" && (
          <div className="flex items-center gap-2 text-green-400 animate-pulse">
            <span>✅ Pulsa "Detener" para enviar tu mensaje</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;