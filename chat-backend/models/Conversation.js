// models/Conversation.js
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true } // añade createdAt y updatedAt automáticamente
);

// Índice compuesto para búsquedas eficientes por userId + topic
ConversationSchema.index({ userId: 1, topic: 1 }, { unique: true });

export default mongoose.model('Conversation', ConversationSchema);
