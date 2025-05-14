import React from "react";
import Modal from "./Modal";

/**
 * ChatModal
 * Modal para decidir si continuar o iniciar una nueva conversación.
 * @param {Object} props
 * @param {boolean} props.showModal - Si se muestra el modal
 * @param {Function} props.handleContinueConversation - Acción para continuar conversación previa
 * @param {Function} props.handleNewConversation - Acción para iniciar nueva conversación
 * @param {Function} props.closeModal - Acción para cerrar el modal
 */
const ChatModal = ({ showModal, handleContinueConversation, handleNewConversation, closeModal }) => {
  if (!showModal) return null;

  return (
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
      onClose={closeModal}
    />
  );
};

export default ChatModal;