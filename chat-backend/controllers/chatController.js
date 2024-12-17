// controllers/chatController.js
import { handleChatMessage, handleTextToSpeech, fetchLastConversation, handleSaveConversation } from '../services/chatService.js';
// controllers/chatController.js
import { callOpenAIChat } from '../services/externalApiService.js';


export const processChatMessage = async (req, res) => {
  try {
    const { message, isLesson, lessonDetails, isInitialMessage, chatHistory } = req.body;
    const userLevel = req.user?.level || 'A1'; // Asegúrate de que el nivel del usuario esté disponible

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Mensaje vacío o inválido recibido." });
    }
    
    // Verificar si es el mensaje inicial
    if (isInitialMessage) {
      const initialMessage = isLesson
        ? `Hello! Welcome to your lesson on ${lessonDetails?.name ? ` on ${lessonDetails.name}` : ''}. Let's get started!`
        : "Hello! Welcome to our English practice session. How can I help you today?";
      
      return res.status(200).json({ botMessage: initialMessage });
    }

    // Procesar el mensaje normalmente
    const botMessage = await handleChatMessage(message, isLesson, userLevel, lessonDetails, chatHistory);
    res.status(200).json({ botMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const getLastConversationController = async (req, res) => {
  try {
    const conversation = await fetchLastConversation();

    if (!conversation) {
      return res.status(404).json({ message: 'No hay conversaciones previas disponibles.' });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error('Error al obtener la última conversación:', error);
    res.status(500).json({ error: 'Error al obtener la última conversación.' });
  }
};

// Exportar todos los controladores necesarios
export const saveConversationController = async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Conversación inválida o faltante.' });
    }

    const result = await handleSaveConversation(conversation);
    res.status(200).json({ message: 'Conversación guardada exitosamente.', data: result });
  } catch (error) {
    console.error('Error al guardar la conversación:', error);
    res.status(500).json({ error: 'Error al guardar la conversación.' });
  }
};

export const processWelcomeMessage = async (req, res) => {
  const { level = 'A1' } = req.query; // Nivel predeterminado: A1

  try {
    const messages = [
      {
        role: 'system',
        content: `You are an English tutor. Greet the student according to their level: ${level}.`,
      },
    ];
    const botMessage = await callOpenAIChat(messages);
    res.status(200).json({ botMessage });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el saludo inicial' });
  }
};

export const processTextToSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto requerido para síntesis de voz.' });
    }

    const audioContent = await handleTextToSpeech(text);
    res.set('Content-Type', 'audio/mp3');
    res.send(audioContent);
  } catch (error) {
    console.error('Error en TTS:', error);
    res.status(500).json({ error: 'Error en el servicio de TTS.' });
  }
};