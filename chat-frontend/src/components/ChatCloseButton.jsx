import React, { useState } from 'react';

const ChatCloseButton = ({ onReturnHome }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmClose = async () => {
    setIsLoading(true);
    try {
      // Solo se llama a la función de guardado proveniente del ChatScreen
      await onReturnHome();
    } catch (error) {
      console.error('Error al guardar la conversación:', error);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="bg-buttonCloseColor w-32 text-white px-4 py-2 rounded hover:bg-red-600"
        onClick={() => setShowModal(true)}
      >
        Cerrar Chat
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">¿Cerrar chat?</h2>
            <p className="mb-4">
              Si cierras el chat, la conversación se guardará y regresarás a la pantalla principal.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${isLoading ? 'opacity-50' : ''}`}
                onClick={handleConfirmClose}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatCloseButton;
