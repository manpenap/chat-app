// repositories/chatRepository.js
import Conversation from '../models/Conversation.js';

// Crear o actualizar conversación (upsert)
export const saveConversationWithTopic = async (userId, conversation, topic) => {
  return await Conversation.findOneAndUpdate(
    { userId, topic },
    {
      content: conversation,
      updatedAt: new Date(), // Opcional, ya que Mongoose actualiza esto automáticamente
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

// Obtener la conversación por usuario y tópico
export const getLastConversationByTopic = async (userId, topic) => {
  return await Conversation.findOne({ userId, topic }).sort({ createdAt: -1 });
};

// Eliminar conversación por usuario y tópico
export async function deleteConversationByUserAndTopic(userId, topic) {
  return await Conversation.deleteOne({ userId, topic });
}
