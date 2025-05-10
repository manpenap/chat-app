import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { registerUser } from "../services/api"; // Importa la función centralizada

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const levels = ["Beginner", "Basic", "Pre-Intermediate", "Upper-Intermediate", "Advanced"];

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (!name || !email || !password || !level) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      // Llama a la función centralizada para registrar al usuario
      await registerUser(name, email, password, level);
      navigate("/login");
    } catch (err) {
      let errorMessage = "Hubo un problema durante el registro. Inténtalo de nuevo.";

      // Verifica si el error viene del backend indicando que el email ya existe
      if (err.response && err.response.status === 400) {
        const msg = err.response.data.message || "";
        if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("registrado")) {
          errorMessage = "El email ya está registrado.";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-backgroundAlternative flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-textSecondColor mb-6">Registro</h1>

        {error && (
          <div className="mb-4">
            <p className="text-red-500">{error}</p>
            {error === "El email ya está registrado." && (
              <button
                onClick={handleRedirectToLogin}
                className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Ir a Iniciar Sesión
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center">
            <ClipLoader size={50} color={"#3498db"} loading={loading} />
            <p className="text-xl font-bold text-center text-textSecondColor mb-6 animate-pulse">
              Conectándose al Servidor...
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-textMainColor text-sm font-semibold mb-2">Nombre</label>
              <input
                type="text"
                placeholder="Ingresa tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textMainColor text-sm font-semibold mb-2">Correo</label>
              <input
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textMainColor text-sm font-semibold mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-textMainColor text-sm font-semibold mb-2">Nivel de Inglés</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Selecciona tu nivel</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRegister}
              className="w-full bg-buttonColor text-white py-2 rounded hover:bg-buttonColorHover transition duration-200 mb-4"
            >
              Registrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterScreen;
