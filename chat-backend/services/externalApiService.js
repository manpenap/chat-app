// services/externalApiService.js
import OpenAI from 'openai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ttsClient = new TextToSpeechClient();

/**
 * Llamada a la API de OpenAI
 * @param {Array} messages - Mensajes en el formato esperado por OpenAI
 * @param {String} model - Modelo de OpenAI (por defecto: 'gpt-3.5-turbo')
 * @returns {Object} Respuesta de OpenAI
 */
export const callOpenAIChat = async (messages, model = 'gpt-3.5-turbo') => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error llamando a la API de OpenAI:', error);
    throw new Error('Error al procesar la solicitud con OpenAI');
  }
};

/**
 * Genera audio usando Google TTS
 * @param {String} text - Texto para sintetizar
 * @param {String} languageCode - Código del idioma (por defecto: 'en-US')
 * @param {String} voiceName - Nombre de la voz (opcional)
 * @param {String} gender - Género de la voz ('MALE', 'FEMALE', 'NEUTRAL')
 * @returns {Buffer} Contenido de audio en formato MP3
 */
export const synthesizeSpeech = async (text, languageCode = 'en-US', voiceName = 'en-US-Standard-E', gender = 'FEMALE') => {
  try {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode, name: voiceName, ssmlGender: gender },
      audioConfig: { audioEncoding: 'MP3' },
    });
    return response.audioContent;
  } catch (error) {
    console.error('Error en Text-to-Speech:', error);
    throw new Error('Error al sintetizar el audio');
  }
};
