// repositories/chatRepository.js
import Conversation from '../models/Conversation.js';

export const getLastConversation = async () => {
  return await Conversation.findOne().sort({ timestamp: -1 });
};

export const saveConversation = async (content) => {
    const newConversation = new Conversation({
      content,
      timestamp: new Date(),
    });
    return await newConversation.save();
  };