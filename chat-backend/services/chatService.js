// services/chatService.js
import { callOpenAIChat, synthesizeSpeech } from './externalApiService.js';
import { getLastConversationByTopic, saveConversationWithTopic } from '../repositories/chatRepository.js';
import { createOrUpdateChatSession, getChatSession, endChatSession } from '../repositories/chatSessionRepository.js'; // Nuevo repositorio para ChatSession
import { estimateTokens } from '../utils/tokenEstimator.js'; // Utilidad para estimar tokens
import { grantDailyConversationAchievement } from '../services/achievementService.js'; // Importa el servicio de logros

const MAX_TOKENS = 3500; // Límite de tokens para el contexto
const SUGGEST_END_MINUTES = 5; // Tiempo mínimo para sugerir finalizar
const FORCE_END_MINUTES = 10; // Tiempo máximo antes de finalizar automáticamente

export const handleChatMessage = async (userId, message, topic, userLevel, chatHistory) => {
  // 1. Gestionar la sesión de chat
  let chatSession = await getChatSession(userId, topic);
  if (!chatSession) {
    chatSession = await createOrUpdateChatSession(userId, topic, { startTime: new Date(), lastInteraction: new Date() });
  } else {
    await createOrUpdateChatSession(userId, topic, { lastInteraction: new Date() });
  }

  // Calcular la duración de la sesión
  const sessionDuration = (new Date() - new Date(chatSession.startTime)) / 1000 / 60; // En minutos

  // 2. Controlar duración de la conversación
  if (sessionDuration >= SUGGEST_END_MINUTES && sessionDuration < FORCE_END_MINUTES) {
    return {
      botMessage: `You've been practicing for ${Math.floor(sessionDuration)} minutes. Would you like to end the session and receive feedback?`,
      suggestEnd: true,
    };
  }

  if (sessionDuration >= FORCE_END_MINUTES) {
    const feedback = generateFeedback(chatHistory);
    await endChatSession(chatSession._id); // Marcar la sesión como finalizada

    // Otorgar logro diario
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await grantDailyConversationAchievement(userId, today);

    return {
      botMessage: `Thank you for practicing! Here's your feedback: ${feedback}. See you next time!`,
      sessionEnded: true,
      achievementGranted: true, // Puedes retornar esto para el frontend
      achievementDate: today
    };
  }

  // 3. Limitar el uso de tokens
  const estimatedTokens = estimateTokens(chatHistory);
  if (estimatedTokens > MAX_TOKENS) {
    chatHistory = trimChatHistory(chatHistory, MAX_TOKENS);
  }

  // 4. Construir el mensaje del sistema
  let systemMessage;
  if (topic && topic !== 'free topic') {
    systemMessage = `
      You are an English tutor guiding a conversation on the topic "${topic}".
      Adjust your language complexity according to the student's level: ${userLevel}.
      Engage in a discussion that remains focused on "${topic}".
      When the student makes very evident grammatical mistakes, provide corrections and offer additional feedback if requested.
      Encourage active participation and ensure that the conversation stays on topic.
      Do not include emoticons, emojis, asterisks, or any special symbols in your responses.
      Respond clearly and naturally, as the output will be converted to speech.
    `;
  } else {
    systemMessage = `
      You are an English tutor facilitating a free conversation practice.
      Allow the student to choose topics during the conversation while providing guidance.
      When very evident grammatical errors occur, correct them and offer feedback if requested.
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

  // 5. Llamar a la API de OpenAI
  const messages = [
    { role: 'system', content: systemMessage.trim() },
    { role: 'user', content: message },
  ];

  const botResponse = await callOpenAIChat(messages);

  return {
    botMessage: botResponse,
    sessionId: chatSession._id, // Retornar el sessionId para el frontend
  };
};

// Función para generar feedback basado en el historial de la conversación
const generateFeedback = (chatHistory) => {
  const userMessages = chatHistory.filter((entry) => entry.sender === 'user');
  const botMessages = chatHistory.filter((entry) => entry.sender === 'bot');

  const grammarMistakes = userMessages.length > 0 ? 'You made a few grammatical mistakes, but overall your sentences were clear.' : '';
  const vocabulary = userMessages.length > 0 ? 'Your vocabulary usage was appropriate for the topic.' : '';
  const participation = userMessages.length > botMessages.length ? 'Great participation! You were very active in the conversation.' : 'Try to participate more actively in the conversation.';

  return `${grammarMistakes} ${vocabulary} ${participation}`;
};

// Función para recortar el historial de chat si supera el límite de tokens
const trimChatHistory = (chatHistory, maxTokens) => {
  let currentTokens = estimateTokens(chatHistory);
  while (currentTokens > maxTokens && chatHistory.length > 1) {
    chatHistory.shift(); // Eliminar el mensaje más antiguo
    currentTokens = estimateTokens(chatHistory);
  }
  return chatHistory;
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
