import express from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// Ruta para guardar la conversación
router.post('/save-conversation', async (req, res) => {
  const { conversation } = req.body;

  if (!conversation) {
    return res.status(400).send({ error: 'No se proporcionó ninguna conversación para guardar.' });
  }

  try {
    // Guardar la conversación en la base de datos
    const newConversation = new Conversation({
      content: conversation,
      timestamp: new Date(),
    });

    await newConversation.save();

    res.status(200).send({ message: 'Conversación guardada exitosamente.' });
  } catch (error) {
    console.error('Error al guardar la conversación:', error);
    res.status(500).send({ error: 'Error al guardar la conversación.' });
  }
});

// Ruta para obtener la última conversación
router.get('/last-conversation', async (req, res) => {
  try {
    // Obtener la última conversación según la marca de tiempo más reciente
    const lastConversation = await Conversation.findOne().sort({ timestamp: -1 });

    if (!lastConversation) {
      return res.status(404).json({ message: 'No hay conversaciones previas.' });
    }

    res.status(200).json({ conversation: lastConversation.content });
  } catch (error) {
    console.error('Error al obtener la última conversación:', error);
    res.status(500).json({ error: 'Error al cargar la última conversación.' });
  }
});

export default router;

