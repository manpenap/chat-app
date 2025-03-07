import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/user/login", { email, password });
      localStorage.setItem("authToken", response.data.token);

      // Obtener información del usuario
      const userProfile = await axios.get("/api/user/profile", {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      // Verificar la respuesta
      console.log("Perfil del usuario:", userProfile.data);
      const idPath = userProfile.data.id_path;

      if (!idPath) {
        throw new Error("id_path no encontrado en el perfil del usuario");
      }

      // Redirigir a la ruta de aprendizaje

      navigate(`/topic-selection`);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div>
      <h1>Ingreso</h1>
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
      <button onClick={handleLogin}>Ingresar</button>
      <button onClick={handleRegister}>Crear Cuenta</button>
    </div>
  );
};

export default LoginScreen;
