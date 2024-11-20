import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  content: {
    type: Array, // Suponiendo que la conversación es un arreglo de mensajes
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
