import React from "react";

const Modal = ({ title, description, buttons, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal flex flex-col items-center text-textMainColor text-lg">
        <h2 className="">{title}</h2>
        <p>{description}</p>
        <div className="modal-buttons flex gap-4 justify-center w-full">
          {buttons.map((button, index) => (
            <button
              key={index}
              className={button.className}
              onClick={button.onClick}
            >
              {button.label}
            </button>
          ))}
        </div>
        {onClose && (
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
            title="Cerrar"
          >
            ✖
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;