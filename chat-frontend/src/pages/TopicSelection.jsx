import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TopicSelection = () => {
  const [user, setUser] = useState({ name: '' });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Se asume que el token de autenticación ya está almacenado en localStorage
        const response = await axios.get(`${API_URL}/user/profile`, {
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
    <div className='min-h-screen bg-background flex flex-col items-center justify-start gap-4 px-5'>
      <div className='text-center text-textMainColor text-3xl font-bold mt-16 mb-8 '>
        <h1>Hola, {user.name}</h1>
        <h2>¿De qué tema te gustaría hablar hoy?</h2>
      </div>

      <div className='max-w-xs w-full text-center text-2xl'>
        <ul className=''>
          {topics.map((topic) => (
            <li key={topic} style={{ margin: '10px 0' }}>
              <button className='w-full border py-4 rounded-md text-textMainColor border-buttonColor hover:bg-textSecondColor' onClick={() => handleTopicSelect(topic)}>
                {topic}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopicSelection;

