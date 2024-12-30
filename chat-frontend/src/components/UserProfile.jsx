import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState({ name: '', level: '' });
  const levels = ['Principiante', 'Básico', 'Pre-Intermedio', 'Intermedio-Alto', 'Avanzado'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Obtén el token del almacenamiento local o contexto
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
      }
    };
    fetchUserData();
  }, []);
  

  const handleLevelChange = async (e) => {
    const selectedLevel = e.target.value;
    if (selectedLevel === user.level) return;
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/user/profile`, { level: selectedLevel });
      setUser((prevUser) => ({ ...prevUser, level: response.data.level }));
    } catch (error) {
      console.error('Error al actualizar el nivel:', error);
    }
  };

  return (
    <div>
      <h1>Perfil del Usuario</h1>
      <p>Nombre: {user.name}</p>
      <label>
        Nivel de Inglés:
        <select value={user.level} onChange={handleLevelChange}>
          {levels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default UserProfile;
