// chatRepository.js
import Conversation from '../models/Conversation.js';

export async function saveConversationWithTopic(conversation, topic) {
  if (!Array.isArray(conversation)) {
    throw new Error('La conversación debe ser un array.');
  }
  const conv = new Conversation({
    topic,
    content: conversation,
  });
  return await conv.save();
}

export async function getLastConversationByTopic(topic) {
  return await Conversation.findOne({ topic }).sort({ createdAt: -1 });
}
