// services/chatService.js
import { callOpenAIChat, synthesizeSpeech } from './externalApiService.js';
import { getLastConversationByTopic, saveConversationWithTopic } from '../repositories/chatRepository.js';

export const handleChatMessage = async (userId, message, topic, userLevel, chatHistory) => {
  let systemMessage;

  if (topic && topic !== 'free topic') {
    systemMessage = `
      You are an English tutor guiding a conversation on the topic "${topic}".
      Adjust your language complexity according to the student's level: ${userLevel}.
      Engage in a discussion that remains focused on "${topic}".
      When the student makes very evident grammatical mistakes, provide corrections and offer additional feedback if requested.
      At the beginning of a new conversation, greet the student and ask if they are ready to talk about "${topic}", or, if resuming a previous conversation, continue from where you left off.
      Encourage active participation and ensure that the conversation stays on topic.
      Do not include emoticons, emojis, asterisks, or any special symbols in your responses.
      Respond clearly and naturally, as the output will be converted to speech.
    `;
  } else {
    // Caso "Tema Libre"
    systemMessage = `
      You are an English tutor facilitating a free conversation practice.
      Allow the student to choose topics during the conversation while providing guidance.
      When very evident grammatical errors occur, correct them and offer feedback if requested.
      At the beginning of a new conversation, greet the student and ask if they are ready to talk freely, or resume the conversation if applicable.
      Avoid unnecessary repetition of greetings.
      Do not include emoticons, emojis, asterisks, or any special symbols in your responses.
      Respond clearly and naturally, as the output will be converted to speech.
    `;
  }

  // Agregar el historial de la conversación al prompt
  systemMessage += `
  
  Current conversation context:
  ${chatHistory.map((entry) => `${entry.sender}: ${entry.message}`).join('\n')}
  
  Always progress the conversation appropriately and ensure clarity in communication.
  `;

 

  const messages = [
    { role: 'system', content: systemMessage.trim() },
    { role: 'user', content: message },
  ];

  return await callOpenAIChat(messages);
};

export const handleTextToSpeech = async (text) => {
  return await synthesizeSpeech(text);
};

// Recupera la última conversación para un tópico específico
export const fetchLastConversation = async (userId, topic) => {
  const lastConversation = await getLastConversationByTopic(userId, topic);
  return lastConversation ? lastConversation.content : null;
};

// Guarda la conversación actual asociándola al tópico seleccionado
export const handleSaveConversation = async (userId,conversation, topic) => {
  if (!conversation || !Array.isArray(conversation)) {
    throw new Error('Conversación inválida.');
  }
  return await saveConversationWithTopic(userId, conversation, topic);
};
