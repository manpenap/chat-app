// repositories/chatRepository.js
import Conversation from '../models/Conversation.js';

// Crear o actualizar conversación (upsert)
export const saveConversationWithUserAndTopic = async (userId, conversation, topic) => {
  const chat = new Conversation({
    userId,
    topic,
    content: conversation,
    timestamp: new Date(),
  });
  await conversation.save();
};

// Obtener la conversación por usuario y tópico
export const getLastConversationByUserAndTopic = async (userId, topic) => {
  return await Chat.findOne({ userId, topic }).sort({ createdAt: -1 });
};

// Eliminar conversación por usuario y tópico
export async function deleteConversationByUserAndTopic(userId, topic) {
  return await Conversation.deleteOne({ userId, topic });
}
