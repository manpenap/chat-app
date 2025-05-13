import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: Date.now },
  endTime: { type: Date },
  ended: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('ChatSession', ChatSessionSchema);