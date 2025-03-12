import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const levels = ['Beginner', 'Basic', 'Pre-Intermediate', 'Upper-Intermediate', 'Advanced'];

  const handleRegister = async () => {
    if (!name || !email || !password || !level) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    
    try {
      await axios.post('/api/user/register', { name, email, password, level });
      navigate('/login');
    } catch (error) {
      console.error('Error durante el registro:', error);
      setError('Hubo un problema durante el registro. Inténtalo de nuevo.');
    }
  };

  const handleEvaluateLevel = () => {
    navigate('/evaluation');
  };

  return (
    <div className="min-h-screen bg-backgroundAlternative flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-textSecondColor mb-6">Registro</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-textMainColor text-sm font-semibold mb-2">Nombre</label>
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-textMainColor text-sm font-semibold mb-2">Correo</label>
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-textMainColor text-sm font-semibold mb-2">Contraseña</label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-textMainColor text-sm font-semibold mb-2">Nivel de Inglés</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">Selecciona tu nivel</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleRegister}
          className="w-full bg-buttonColor text-white py-2 rounded hover:bg-buttonColorHover transition duration-200 mb-4"
        >
          Registrar
        </button>
        
      </div>
    </div>
  );
};

export default RegisterScreen;
