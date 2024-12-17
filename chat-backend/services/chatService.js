// services/chatService.js
import { callOpenAIChat, synthesizeSpeech } from './externalApiService.js';
import { getLastConversation, saveConversation } from '../repositories/chatRepository.js';

export const handleChatMessage = async (message, isLesson, userLevel, lessonDetails, chatHistory) => {
  let systemMessage;

  if (isLesson) {
    // Genera un prompt personalizado según el tipo de lección
    const { type, name, content, unitObjective, pathLevel } = lessonDetails;

    systemMessage = `
      You are an English tutor guiding a student in their learning path.
      Adjust your language complexity according to their level: ${userLevel}.
      Learning Path Level: ${pathLevel}.
      Unit Objective: "${unitObjective}".
      Lesson Type: "${type}".
      

      ${
        type === 'introductory'
          ? `Provide a general introduction to the topic of the unit.`
          : type === 'grammar'
          ? `Explain grammar concepts about "${name}" based on this context: "${content?.text}". Encourage the student to participate and correct mistakes as necessary.`
          : type === 'vocabulary'
          ? `Teach vocabulary related to "${name}" based on this context: "${content?.text}". Use examples and ask the student to create their own sentences.`
          : type === 'evaluation'
          ? `Prepare an evaluation to assess the student's understanding of the unit topics. Use questions that test their knowledge and provide feedback.`
          : `Provide guidance relevant to the student's learning path.`
      }

        Current conversation context:
        ${chatHistory.map((entry) => `${entry.sender}: ${entry.message}`).join('\n')}

      

        Always progress towards the lesson's objective and avoid unnecessary repetition.

        Important:
              - Do not include emoticons, emojis, asterisks, or any special symbols in your responses.
              - Respond clearly and naturally, as the output will be converted to speech.
    `;
  } else {
    // Default prompt for free conversation
    systemMessage = `You are an English tutor assisting with a free conversation practice. Suggest a topic suitable for their level: ${userLevel}. Avoid repeating greetings unnecessarily.Do not include emoticons, emojis, asterisks, or any special symbols in your responses. Respond clearly and naturally, as the output will be converted to speech. `;
  }

  console.log('System Prompt:', systemMessage);

  const messages = [
    { role: 'system', content: systemMessage.trim() },
    { role: 'user', content: message },
  ];

  // Llama a la API de OpenAI para generar la respuesta
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