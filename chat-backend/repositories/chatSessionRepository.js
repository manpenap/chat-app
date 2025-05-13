import ChatSession from '../models/ChatSession.js'; // Modelo de ChatSession

// Crear o actualizar una sesión de chat
export const createOrUpdateChatSession = async (userId, topic, updates) => {
  return await ChatSession.findOneAndUpdate(
    { userId, topic, ended: false }, // Buscar una sesión activa para el usuario y el tema
    { ...updates, userId, topic }, // Actualizar los campos proporcionados
    { upsert: true, new: true, setDefaultsOnInsert: true } // Crear si no existe
  );
};

// Obtener una sesión de chat activa
export const getChatSession = async (userId, topic) => {
  return await ChatSession.findOne({ userId, topic, ended: false });
};

// Finalizar una sesión de chat
export const endChatSession = async (sessionId) => {
  return await ChatSession.findByIdAndUpdate(sessionId, { ended: true, endTime: new Date() });
};