// services/chatService.js
import { callOpenAIChat, synthesizeSpeech } from "./externalApiService.js";
import {
  getLastConversationByTopic,
  saveConversationWithTopic,
} from "../repositories/chatRepository.js";

/**
 * Evalúa la gramática y estructura de una frase utilizando la API de OpenAI.
 * La función prepara un prompt que le indica a OpenAI que clasifique la frase en tres niveles:
 * - "Excellent" (verde): bien estructurada.
 * - "Good Work" (amarillo): con problemas menores.
 * - "It needs to improve" (rojo): con problemas significativos.
 * Además, solicita una explicación detallada de las mejoras necesarias.
 *
 * @param {String} message - La frase a evaluar.
 * @returns {Object} Objeto con las propiedades: color, label y explanation.
 */

export const evaluateGrammar = async (message) => {
  // Preparamos el prompt que se enviará a OpenAI
  const prompt = `
Evaluate the following sentence for grammar and structure:
"${message}"
Classify the sentence according to the following rules:
- If it is well-structured, classify as "Excellent" and use the color "green".
- If it has minor issues, classify as "Good Work" and use the color "yellow".
- If it has significant issues, classify as "It needs to improve" and use the color "red".
Then, provide a detailed explanation of the improvements needed. 
Don´t cosiderate for your evaluation issues with punctuation, capitalization. For example "I'm fine thank you" is "Excellent". Only evalute issues like word order, verb tenses and clarity in the sentences.
Return the result as a JSON object with the keys "color", "label", and "explanation".
  `;

  try {
    // Creamos el array de mensajes en el formato requerido por la función callOpenAIChat
    const messages = [
      {
        role: "user",
        content: prompt,
      },
    ];

    // Llamamos a la API de OpenAI mediante externalApiService
    const response = await callOpenAIChat(messages, "gpt-3.5-turbo");

    // Intentamos extraer el objeto JSON de la respuesta
    const jsonStart = response.indexOf("{");
    const jsonString = response.slice(jsonStart);
    const evaluation = JSON.parse(jsonString);
    return evaluation;
  } catch (error) {
    console.error("Error evaluating grammar:", error);
    // Resultado de fallback en caso de error
    return {
      color: "yellow",
      label: "Good Work",
      explanation:
        "Se detectaron algunos problemas menores en la estructura de la frase.",
    };
  }
};

export const handleChatMessage = async (
  message,
  topic,
  userLevel,
  chatHistory
) => {
  let systemMessage;

  if (topic && topic !== "free topic") {
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
  ${chatHistory.map((entry) => `${entry.sender}: ${entry.message}`).join("\n")}
  
  Always progress the conversation appropriately and ensure clarity in communication.
  `;

  console.log("System Prompt:", systemMessage);

  const messages = [
    { role: "system", content: systemMessage.trim() },
    { role: "user", content: message },
  ];

  return await callOpenAIChat(messages);
};

export const handleTextToSpeech = async (text) => {
  return await synthesizeSpeech(text);
};

// Recupera la última conversación para un tópico específico
export const fetchLastConversation = async (topic) => {
  const lastConversation = await getLastConversationByTopic(topic);
  return lastConversation ? lastConversation.content : null;
};

// Guarda la conversación actual asociándola al tópico seleccionado
export const handleSaveConversation = async (conversation, topic) => {
  if (!conversation || !Array.isArray(conversation)) {
    throw new Error("Conversación inválida.");
  }
  return await saveConversationWithTopic(conversation, topic);
};
