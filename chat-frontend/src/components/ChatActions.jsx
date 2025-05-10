import React from "react";
import ChatCloseButton from "./ChatCloseButton";

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