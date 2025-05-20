import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  ended: { type: Boolean, default: false },
  // Flags para saber si ya se preguntó al usuario en los umbrales de palabras
  askedAt500: { type: Boolean, default: false },
  askedAt800: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('ChatSession', ChatSessionSchema);