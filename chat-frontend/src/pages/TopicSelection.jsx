import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserProfile } from "../services/api";

const TopicSelection = () => {
  const [user, setUser] = useState({ name: "" });
  const navigate = useNavigate();
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await fetchUserProfile(authToken); // Llamada a la API centralizada
        setUser(profile);
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
      }
    };

    fetchProfile();
  }, [authToken]);

  const topics = ["free topic", "music", "sports", "travels", "movies", "romances"];

  const handleTopicSelect = (topic) => {
    navigate("/chatscreen", { state: { topic } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start gap-4 px-5">
      <div className="text-center text-textMainColor text-3xl font-bold mt-16 mb-8">
        <h1>Hola, {user.name}</h1>
        <h2>¿De qué tema te gustaría hablar hoy?</h2>
      </div>

      <div className="max-w-xs w-full text-center text-2xl">
        <ul>
          {topics.map((topic) => (
            <li key={topic} style={{ margin: "10px 0" }}>
              <button
                className="w-full border py-4 rounded-md text-textMainColor border-buttonColor hover:bg-textSecondColor"
                onClick={() => handleTopicSelect(topic)}
              >
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

