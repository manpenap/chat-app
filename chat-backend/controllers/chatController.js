// chatController.js
import * as chatService from '../services/chatService.js';



export const evaluateGrammar = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "El mensaje es requerido" });
  }
  try {
    const evaluation = await chatService.evaluateGrammar(message);
    res.json(evaluation);
  } catch (error) {
    console.error("Error al evaluar la gramática:", error);
    res.status(500).json({ error: "Error evaluando la gramática" });
  }
};

export const getWelcomeMessage = async (req, res) => {
  try {
    const { topic, level } = req.query;
    if (!topic || !level) {
      return res.status(400).json({ error: 'Los parámetros "topic" y "level" son requeridos.' });
    }

    let welcomeMessage = '';
    if (topic === 'free topic') {
      welcomeMessage = "Welcome! How are you today? What would you like to talk about?";
    } else {
      welcomeMessage = `Welcome! Are yo ready to talk about "${topic}"?`;
    }

    // Puedes incluir lógica adicional o incluso llamar a chatService si deseas un mensaje más elaborado.
    res.json({ botMessage: welcomeMessage });
  } catch (error) {
    console.error('Error obteniendo el mensaje de bienvenida:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const getLastConversation = async (req, res) => {
  try {
    const { topic } = req.query;
    if (!topic) {
      return res.status(400).json({ error: 'El parámetro "topic" es requerido.' });
    }
    const conversation = await chatService.fetchLastConversation(topic);
    // En lugar de devolver 404, devolvemos un array vacío si no se encontró conversación.
    res.json({ conversation: conversation || [] });
  } catch (error) {
    console.error('Error obteniendo la última conversación:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const saveConversation = async (req, res) => {
  try {
    const { conversation, topic } = req.body;
    if (!conversation || !topic) {
      return res.status(400).json({ error: 'Se requieren "conversation" y "topic".' });
    }
    const saved = await chatService.handleSaveConversation(conversation, topic);
    res.json({ saved });
  } catch (error) {
    console.error('Error al guardar la conversación:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const handleChat = async (req, res) => {
  try {
    const { message, topic, userLevel, chatHistory } = req.body;
    const botResponse = await chatService.handleChatMessage(message, topic, userLevel, chatHistory);
    res.json({ botMessage: botResponse });
  } catch (error) {
    console.error('Error manejando el chat:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Exportar todas las funciones en un objeto por defecto
export default {
  getWelcomeMessage,
  getLastConversation,
  saveConversation,
  handleChat,
  evaluateGrammar,
};
