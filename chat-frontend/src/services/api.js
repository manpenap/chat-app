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
    console.error("Error en la API:", error.response?.data || error.message);

    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          alert(data.message || "Solicitud incorrecta (400)");
          break;
        case 401:
          alert("No autorizado. Por favor, inicia sesión nuevamente.");
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

    return Promise.reject(error);
  }
);

// Función para iniciar sesión
export const loginUser = async (email, password) => {
  const response = await apiClient.post("/user/login", { email, password });
  return response.data; // Asegúrate de devolver los datos de la respuesta
};

// Función para registrar un nuevo usuario
export const registerUser = async (name, email, password, level) => {
  const response = await apiClient.post("/user/register", {
    name,
    email,
    password,
    level,
  });
  return response.data; // Devuelve los datos de la respuesta
};

// Función para obtener el perfil del usuario
export const fetchUserProfile = async (token) => {
  const response = await apiClient.get("/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // Devuelve directamente los datos del perfil
};

// Función para obtener el mensaje de bienvenida
export const fetchWelcomeMessage = async (topic, level, token) => {
  return apiClient.get("/chat/welcome", {
    params: { topic, level },
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Función para traducir mensajes
export const translateMessage = async (message) => {
  const response = await axios.get("https://api.mymemory.translated.net/get", {
    params: {
      q: message,
      langpair: "en|es",
    },
  });
  return response.data.responseData.translatedText;
};



// Función para obtener la conversación previa
export const fetchPreviousConversation = async (topic, token) => {
  return apiClient.get("/chat/last-conversation", {
    params: { topic },
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Función para guardar la conversación
export const saveConversation = async (conversation, topic, token) => {
  return apiClient.post(
    "/chat/save-conversation",
    { conversation, topic },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Función para enviar un mensaje al bot
export const sendMessageToBot = async (payload, token) => {
  return apiClient.post("/chat", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

