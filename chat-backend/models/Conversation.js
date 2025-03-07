// models/Conversation.js
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  content: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Conversation', ConversationSchema);
