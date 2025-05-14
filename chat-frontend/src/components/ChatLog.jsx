/**
 * ChatLog
 * Muestra el historial de mensajes del chat.
 * @param {Object} props
 * @param {Array} props.chatLog - Historial de mensajes
 * @param {Function} props.playText - Función para reproducir audio del mensaje
 * @param {Function} props.handleTranslate - Función para traducir mensajes
 * @param {Object} props.translations - Traducciones de mensajes
 */
const ChatLog = ({ chatLog, playText, handleTranslate, translations }) => {
  return (
    <div className="chat-log">
      {chatLog.map((entry, index) => (
        <div
          key={index}
          className={`${
            entry.sender === "user"
              ? "user-message text-end bg-backgroundAlternative my-2 ps-4 pe-4"
              : "bot-message text-start bg-backgroundLight my-2 ps-4 pe-4 relative"
          } py-4 rounded-lg flex flex-col`}
        >
          <strong className="text-sm italic">
            {entry.sender === "user" ? "You: " : "System: "}
          </strong>
          {typeof entry.message === "string" ? entry.message : "Invalid message format"}

          <div className="mt-2 flex justify-between">
            {entry.sender !== "user" && (
              <div className="flex items-start">
                <button
                  className="text-xs text-textSecondColor italic hover:text-buttonColor"
                  onClick={() => playText(entry.message)}
                  title="Reproducir audio"
                >
                  🔊 Listen again!
                </button>
              </div>
            )}

            {translations[index] && (
              <p className="text-xs text-textMainColor italic">
                {translations[index]}
              </p>
            )}

            {!translations[index] && entry.sender !== "user" && (
              <button
                className="text-xs text-textSecondColor italic hover:text-buttonColor"
                onClick={() => handleTranslate(index, entry.message)}
                title="Traducir mensaje"
              >
                🌐 Translate
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatLog;