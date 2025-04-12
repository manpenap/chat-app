import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners"; // Importa el spinner de react-spinners

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado para controlar la carga
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async () => {
    setLoading(true); // Activa el spinner
    setError(null); // Limpia cualquier error anterior
    try {
      const response = await axios.post(`${API_URL}/user/login`, { email, password });
      localStorage.setItem("authToken", response.data.token);

      const userProfile = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      const idPath = userProfile.data.id_path;

      if (!idPath) {
        throw new Error("id_path no encontrado en el perfil del usuario");
      }

      navigate(`/topic-selection`);
    } catch (error) {
      setError("Error durante el inicio de sesión. Intenta de nuevo.");
      console.error("Error during login:", error);
    } finally {
      setLoading(false); // Desactiva el spinner
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-backgroundAlternative flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-textSecondColor mb-6">Bienvenido</h1>
        <p className="text-xl font-bold text-center text-textSecondColor mb-6 animate-pulse">Conectándose al Servidor...</p>
        {loading ? (
          <div className="flex justify-center items-center">
            <ClipLoader size={50} color={"#3498db"} loading={loading} />
          </div>
        ) : (
          <div>
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
              disabled={loading} // Deshabilita el botón mientras se carga
              className="w-full bg-buttonColor text-white py-2 rounded hover:bg-buttonColorHover transition duration-200 mb-4"
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>
            <button
              onClick={handleRegister}
              className="w-full border border-buttonColor text-buttonColor py-2 rounded hover:bg-blue-50 transition duration-200"
            >
              Crear Cuenta
            </button>
          </div>
        )}
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default LoginScreen;
