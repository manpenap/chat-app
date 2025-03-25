import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      // Se envía el correo al endpoint encargado de recuperar la contraseña
      const response = await axios.post('/api/user/forgot-password', { email });
      // Supongamos que el backend envía un mensaje confirmando el envío
      setMessage('Hemos enviado instrucciones a tu correo para recuperar la contraseña.');
    } catch (err) {
      console.error('Error al recuperar contraseña:', err);
      setError('Ocurrió un error. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-backgroundAlternative flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-textSecondColor mb-6">
          Recuperar Contraseña
        </h1>
        {message ? (
          <p className="text-green-500 mb-4">{message}</p>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-4">
              <label className="block text-textMainColor text-sm font-semibold mb-2">
                Ingresa tu correo
              </label>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-buttonColor text-white py-2 rounded hover:bg-buttonColorHover transition duration-200"
            >
              Enviar Instrucciones
            </button>
          </form>
        )}
        <button
          className="mt-4 w-full border border-buttonColor text-buttonColor py-2 rounded hover:bg-blue-50 transition duration-200"
          onClick={() => navigate("/login")}
        >
          Volver al Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
