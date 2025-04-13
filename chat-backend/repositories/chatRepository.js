// repositories/chatRepository.js
import Conversation from '../models/Conversation.js';

// Crear o actualizar conversación (upsert)
export const saveConversationWithTopic = async (userId, conversation, topic) => {
  const chat = new Conversation({
    userId,
    topic,
    content: conversation,
    timestamp: new Date(),
  });
  await conversation.save();
};

// Obtener la conversación por usuario y tópico
export const getLastConversationByTopic = async (userId, topic) => {
  return await Conversation.findOne({ userId, topic }).sort({ createdAt: -1 });
};

// Eliminar conversación por usuario y tópico
export async function deleteConversationByUserAndTopic(userId, topic) {
  return await Conversation.deleteOne({ userId, topic });
}
