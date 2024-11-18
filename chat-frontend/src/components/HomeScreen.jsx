import React from "react";
import { Link } from "react-router-dom";

const HomeScreen = () => {
  return (
    <div>
      <h1>Bienvenido a la Evaluación de Inglés</h1>
      <Link to="/evaluation">Comenzar Evaluación</Link>
      <Link to="/practice" style={{ marginLeft: '10px' }}>Práctica de Conversación</Link>
      <Link to="/profile" style={{ marginLeft: '10px' }}>Perfil del Usuario</Link>
    </div>
  );
};

export default HomeScreen;
