import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { loginUser, fetchUserProfile } from "../services/api";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {

      
      const { token,level } = await loginUser(email, password); // Llamada a la API centralizada
     
      login(token, level); // Guardar el token en AuthContext

      const userProfile = await fetchUserProfile(token); // Obtener el perfil del usuario
      

      // Ajusta el acceso a id_path según la estructura de la respuesta
      const idPath = userProfile.data?.id_path || userProfile.id_path;

      if (!idPath) {
        throw new Error("id_path no encontrado en el perfil del usuario");
      }

      navigate("/topic-selection");
    } catch (error) {
      setError("Error durante el inicio de sesión. Intenta de nuevo.");
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-backgroundAlternative flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-textSecondColor mb-6">Bienvenido</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <ClipLoader size={50} color={"#3498db"} loading={loading} />
            <p className="text-xl font-bold text-center text-textSecondColor mb-6 animate-pulse">Conectándose al Servidor...</p>
          </div>
        ) : (
          <div>
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
            <div className="mb-6">
              <label className="block text-textMainColor text-sm font-semibold mb-2">Contraseña</label>
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
              disabled={loading}
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
