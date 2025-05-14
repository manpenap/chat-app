import React from "react";

/**
 * ErrorBanner
 * Muestra un banner de error fijo en la parte superior.
 * @param {Object} props
 * @param {string|null} props.error - Mensaje de error a mostrar
 * @param {Function} props.clearError - Función para limpiar el error
 */
const ErrorBanner = ({ error, clearError }) => {
  if (!error) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-2 z-50">
      <p>{error}</p>
      <button
        onClick={clearError}
        className="absolute top-2 right-4 text-white font-bold"
      >
        ✕
      </button>
    </div>
  );
};

export default ErrorBanner;