import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import 'dotenv/config';

// Importa tus rutas (ejemplo)
import contentRoutes from './routes/contentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configura el cliente de Text-to-Speech de Google Cloud
const ttsClient = new TextToSpeechClient();

// Conectar a MongoDB Atlas usando la URL de conexión en el archivo .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conexión exitosa a MongoDB Atlas'))
  .catch((error) => console.error('Error conectando a MongoDB Atlas:', error));

// Simulación de datos de perfil de usuario en memoria
let userProfile = {
  name: 'Manuel',
  level: 'A1',
};

// Endpoint para el perfil del usuario
app.get('/api/user/profile', (req, res) => {
  res.json(userProfile);
});

app.put('/api/user/profile', (req, res) => {
  const { level } = req.body;
  const validLevels = ['A0', 'A1-A2', 'A2-B1', 'B1', 'B2', 'C1-C2'];
  if (!validLevels.includes(level)) {
    return res.status(400).json({ message: 'Nivel inválido' });
  }
  userProfile.level = level;
  res.json({ message: 'Nivel actualizado correctamente', level: userProfile.level });
});

// Nuevo endpoint para el saludo inicial
app.get('/api/chat/welcome', async (req, res) => {
  const userLevel = req.query.level || 'A0'; // Obtener el nivel del usuario de la consulta o usar 'A0' por defecto

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an English tutor. Greet the student according to their English level. 
            If the level is A0 or A1-A2, keep the greeting simple and slow. 
            If the level is A2-B1 or B1, make the greeting friendly but slightly more complex.
            For B2 and above, use a more advanced and conversational tone. 
            Ask if they are ready to begin the lesson. The user's level is ${userLevel}.`,
        },
      ],
    });

    // Enviar el saludo personalizado
    res.json({ botMessage: response.choices[0].message.content });
  } catch (error) {
    console.error('Error al obtener el saludo inicial:', error);
    res.status(500).json({ error: 'Error al obtener el saludo inicial' });
  }
});

// Ruta para manejar el chat
app.post('/api/chat', async (req, res) => {
  const { message, isLesson } = req.body;
  const userLevel = userProfile.level;

  try {
    // Configuración inicial del mensaje del sistema basado en el contexto de lección o conversación libre
    let systemMessage = '';

    if (isLesson) {
      systemMessage = `You are an English tutor guiding a student in their learning path. Explain to the student in simple terms what this lesson will cover. 
        Adjust your language complexity according to their level, which is ${userLevel}.`;
    } else {
      systemMessage = `You are an English tutor assisting with a free conversation practice. Start by asking what topic they would like to discuss. 
        If they are unsure, suggest a topic suitable for their level: ${userLevel}.`;
    }

    // Generar la respuesta del tutor de IA usando OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message },
      ],
    });

    // Enviar la respuesta generada
    res.json({ botMessage: response.choices[0].message.content });
  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ error: 'Error procesando el chat' });
  }
});


// Endpoint para finalizar conversación
app.post('/endSession', (req, res) => {
  const { sessionId, feedback } = req.body;

  // Lógica para registrar el fin de la sesión en la base de datos (simulado aquí)
  const result = saveSessionFeedback(sessionId, feedback);

  if (result) {
      res.status(200).json({ message: 'Session ended successfully.' });
  } else {
      res.status(500).json({ message: 'Error ending session.' });
  }
});

function saveSessionFeedback(sessionId, feedback) {
  // Simulación de guardado en base de datos
  console.log(`Session ${sessionId} feedback saved: ${feedback}`);
  return true;
}



// Endpoint para Text-to-Speech
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;

    // Solicitud de síntesis de voz
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', name: 'en-US-Standard-E', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    // Configurar la respuesta para enviar el audio en formato MP3
    res.set('Content-Type', 'audio/mp3');
    res.send(response.audioContent);
  } catch (error) {
    console.error('Error en Text-to-Speech:', error);
    res.status(500).json({ error: 'Error en Text-to-Speech' });
  }
});


// Usa las rutas importadas (asegúrate de que existen los archivos y usa extensiones .js en las importaciones)
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);

// Inicia el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
