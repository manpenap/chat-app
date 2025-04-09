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
      const idPath = userProfile.data.id_path;

      if (!idPath) {
        throw new Error("id_path no encontrado en el perfil del usuario");
      }

      // Redirigir a la selección de tópicos
      navigate(`/topic-selection`);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-backgroundAlternative flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-textSecondColor mb-6">Bienvenido</h1>
        <div className="mb-4">
          <label className="block text-textMainColor text-sm font-semibold mb-2">
            Correo
          </label>
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-textMainColor text-sm font-semibold mb-2">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-buttonColor text-white py-2 rounded hover:bg-buttonColorHover transition duration-200 mb-4"
        >
          Ingresar
        </button>
        <button
          onClick={handleRegister}
          className="w-full border border-buttonColor text-buttonColor py-2 rounded hover:bg-blue-50 transition duration-200"
        >
          Crear Cuenta
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;

