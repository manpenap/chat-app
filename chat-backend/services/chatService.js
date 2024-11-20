// services/chatService.js
import { callOpenAIChat, synthesizeSpeech } from './externalApiService.js';
import { getLastConversation, saveConversation } from '../repositories/chatRepository.js';

export const handleChatMessage = async (message, isLesson, userLevel) => {
  const systemMessage = isLesson
    ? `You are an English tutor guiding a student in their learning path. Adjust your language complexity according to their level: ${userLevel}.`
    : `You are an English tutor assisting with a free conversation practice. Suggest a topic suitable for their level: ${userLevel}.`;

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: message },
  ];

  return await callOpenAIChat(messages);
};

export const handleTextToSpeech = async (text) => {
  return await synthesizeSpeech(text);
};


export const fetchLastConversation = async () => {
  const lastConversation = await getLastConversation();
  return lastConversation ? lastConversation.content : null;
};

export const handleSaveConversation = async (conversation) => {
  if (!conversation || !Array.isArray(conversation)) {
    throw new Error('Conversación inválida.');
  }

  return await saveConversation(conversation);
};