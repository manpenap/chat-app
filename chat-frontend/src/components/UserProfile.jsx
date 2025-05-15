import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { fetchUserAchievements } from "../services/api";

const UserProfile = () => {
  const { authToken, setUserLevel } = useAuth(); // Obtén el token y la función para actualizar el nivel en el contexto
  const [user, setUser] = useState({ name: "", email: "", level: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUser(response.data);
        setUserLevel(response.data.level); // Actualiza el nivel en el contexto
      } catch (error) {
        setError("Error al obtener los datos del perfil.");
        console.error("Error al obtener los datos del perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [authToken, setUserLevel]);

  useEffect(() => {
    const loadAchievements = async () => {
      const data = await fetchUserAchievements(authToken);
      setAchievements(data);
    };
    loadAchievements();
  }, [authToken]);

  return (
    <div className="min-h-screen bg-backgroundAlternative flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-textSecondColor mb-6">Perfil del Usuario</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <p className="text-xl font-bold text-center text-textSecondColor mb-6 animate-pulse">
              Cargando perfil...
            </p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-textMainColor text-sm font-semibold mb-2">Nombre</label>
              <p className="w-full px-4 py-2 border text-textMainColor border-gray-300 rounded bg-backgroundLight">
                {user.name}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-textMainColor text-sm font-semibold mb-2">Email</label>
              <p className="w-full px-4 py-2 border text-textMainColor border-gray-300 rounded bg-backgroundLight">
                {user.email}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-textMainColor text-sm font-semibold mb-2">
                Nivel de Inglés
              </label>
              <p className="w-full px-4 py-2 border text-textMainColor border-gray-300 rounded bg-backgroundLight">
                {user.level}
              </p>
            </div>
            <div>
              <h2>Mis logros diarios</h2>
              <div className="badges">
                {achievements.map((ach, idx) => (
                  <span key={idx} className="badge">
                    🏆 {ach.date}
                  </span>
                ))}
              </div>
              <p>Total de días con logro: {achievements.length}</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-buttonColor text-white py-2 rounded hover:bg-buttonColorHover transition duration-200"
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
