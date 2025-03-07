import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TopicSelection = () => {
  const [user, setUser] = useState({ name: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Se asume que el token de autenticación ya está almacenado en localStorage
        const response = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const topics = [
    'free topic',
    'music',
    'sports',
    'travels',
    'movies',
    'romances'
  ];

  const handleTopicSelect = (topic) => {
    // Se navega a la pantalla de chat pasando el tema seleccionado.
    // Ajusta la ruta y los parámetros según la estructura de tu aplicación.
    navigate('/chatscreen', { state: { topic } });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Hola, {user.name}</h1>
      <h2>¿De qué tema te gustaría hablar hoy?</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {topics.map((topic) => (
          <li key={topic} style={{ margin: '10px 0' }}>
            <button onClick={() => handleTopicSelect(topic)}>
              {topic}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicSelection;

