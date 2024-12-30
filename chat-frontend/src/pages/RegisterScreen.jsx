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
      navigate('/profile');
    } catch (error) {
      console.error('Error durante el registro:', error);
      setError('Hubo un problema durante el registro. Inténtalo de nuevo.');
    }
  };

  const handleEvaluateLevel = () => {
    navigate('/evaluation');
  };

  return (
    <div>
      <h1>Registro</h1>
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label>
        Nivel de Inglés:
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Selecciona tu nivel</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleRegister}>Registrar</button>
      <button onClick={handleEvaluateLevel}>Evaluar Nivel</button>
    </div>
  );
};

export default RegisterScreen;
