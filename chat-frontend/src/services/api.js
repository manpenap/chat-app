import axios from "axios";

// Crear una instancia de Axios personalizada
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL base de la API
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response, // Devolver la respuesta si no hay errores
  (error) => {
    // Manejo centralizado de errores
    console.error("Error en la API:", error.response?.data || error.message);

    // Opcional: Puedes personalizar los mensajes de error según el código de estado
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          alert(data.message || "Solicitud incorrecta (400)");
          break;
        case 401:
          alert("No autorizado. Por favor, inicia sesión nuevamente.");
          // Opcional: Redirigir al usuario a la página de inicio de sesión
          break;
        case 404:
          alert("Recurso no encontrado (404)");
          break;
        case 500:
          alert("Error interno del servidor (500). Inténtalo más tarde.");
          break;
        default:
          alert("Ocurrió un error inesperado. Inténtalo más tarde.");
      }
    } else {
      alert("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
    }

    // Rechazar la promesa para que el componente que llama pueda manejarlo si es necesario
    return Promise.reject(error);
  }
);

// Funciones de la API
export const fetchPreviousConversation = async (topic, token) => {
  return apiClient.get("/chat/last-conversation", {
    params: { topic },
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const saveConversation = async (conversation, topic, token) => {
  return apiClient.post(
    "/chat/save-conversation",
    { conversation, topic },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const sendMessageToBot = async (payload, token) => {
  return apiClient.post("/chat", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};