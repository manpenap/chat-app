// services/chatService.js
import { callOpenAIChat, synthesizeSpeech } from './externalApiService.js';
import { getLastConversationByTopic, saveConversationWithTopic } from '../repositories/chatRepository.js';
import { createOrUpdateChatSession, getChatSession, endChatSession } from '../repositories/chatSessionRepository.js'; // Nuevo repositorio para ChatSession
import { estimateTokens } from '../utils/tokenEstimator.js'; // Utilidad para estimar tokens
import { grantDailyConversationAchievement } from '../services/achievementService.js'; // Importa el servicio de logros

const MAX_TOKENS = 3500; // Límite de tokens para el contexto


// --- NUEVO: Función para contar palabras del usuario ---
const countUserWords = (chatHistory) => {
  return chatHistory
    .filter(entry => entry.sender === 'user')
    .reduce((acc, entry) => acc + (entry.message?.split(/\s+/).length || 0), 0);
};

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

  // --- NUEVO: Lógica basada en palabras pronunciadas ---
  const userWordCount = countUserWords(chatHistory);

  // Dentro de handleChatMessage, antes de la lógica de palabras:
  if (chatSession.askedAt800 && userWordCount >= 800 && /no/i.test(message)) {
    // El usuario dijo que no en 800 palabras, continúa normalmente
    // (No hagas nada especial, solo sigue el flujo)
  }
  if (chatSession.askedAt500 && userWordCount >= 500 && /no/i.test(message)) {
    // El usuario dijo que no en 500 palabras, continúa normalmente
  }
  if ((chatSession.askedAt500 && userWordCount >= 500 && /yes/i.test(message)) ||
      (chatSession.askedAt800 && userWordCount >= 800 && /yes/i.test(message))) {
    // El usuario acepta terminar
    const feedback = generateFeedback(chatHistory);
    await endChatSession(chatSession._id);
    const today = new Date().toISOString().slice(0, 10);
    await grantDailyConversationAchievement(userId, today);

    return {
      botMessage: `Thank you for practicing! Here's your feedback: ${feedback}. See you next time!`,
      sessionEnded: true,
      achievementGranted: true,
      achievementDate: today
    };
  }

  // Si ya preguntó en 1000 palabras o más, termina la sesión automáticamente
  if (userWordCount >= 1000) {
    const feedback = generateFeedback(chatHistory);
    await endChatSession(chatSession._id);
    const today = new Date().toISOString().slice(0, 10);
    await grantDailyConversationAchievement(userId, today);

    return {
      botMessage: `Thank you for practicing! Here's your feedback: ${feedback}. See you next time!`,
      sessionEnded: true,
      achievementGranted: true,
      achievementDate: today
    };
  }

  // Si ya preguntó en 800 palabras y el usuario responde "no", continúa; si responde "yes", termina
  if (chatSession.askedAt800 && userWordCount >= 800) {
    if (/^\s*yes\s*$/i.test(message.trim())) {
      const feedback = generateFeedback(chatHistory);
      await endChatSession(chatSession._id);
      const today = new Date().toISOString().slice(0, 10);
      await grantDailyConversationAchievement(userId, today);

      return {
        botMessage: `Thank you for practicing! Here's your feedback: ${feedback}. See you next time!`,
        sessionEnded: true,
        achievementGranted: true,
        achievementDate: today
      };
    }
    // Si responde "no", continúa la conversación normalmente
  }

  // Si ya preguntó en 500 palabras y el usuario responde "no", continúa; si responde "yes", termina
  if (chatSession.askedAt500 && userWordCount >= 500 && userWordCount < 800) {
    if (/^\s*yes\s*$/i.test(message.trim())) {
      const feedback = generateFeedback(chatHistory);
      await endChatSession(chatSession._id);
      const today = new Date().toISOString().slice(0, 10);
      await grantDailyConversationAchievement(userId, today);

      return {
        botMessage: `Thank you for practicing! Here's your feedback: ${feedback}. See you next time!`,
        sessionEnded: true,
        achievementGranted: true,
        achievementDate: today
      };
    }
    // Si responde "no", continúa la conversación normalmente
  }

  // Pregunta al usuario si quiere terminar en 500 palabras (solo una vez)
  if (userWordCount >= 500 && userWordCount < 800 && !chatSession.askedAt500) {
    await createOrUpdateChatSession(userId, topic, { askedAt500: true });
    return {
      botMessage: "You've pronounced over 500 words! Would you like to end the session and receive feedback? (yes/no)",
      suggestEnd: true,
      wordCount: userWordCount
    };
  }

  // Pregunta al usuario si quiere terminar en 800 palabras (solo una vez)
  if (userWordCount >= 800 && userWordCount < 1000 && !chatSession.askedAt800) {
    await createOrUpdateChatSession(userId, topic, { askedAt800: true });
    return {
      botMessage: "You've pronounced over 800 words! Would you like to end the session and receive feedback? (yes/no)",
      suggestEnd: true,
      wordCount: userWordCount
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
    wordCount: userWordCount // Retornar el conteo de palabras del usuario para depuración
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
