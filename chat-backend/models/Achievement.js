import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  type: { type: String, default: 'daily_conversation' }, // extensible a otros logros
  createdAt: { type: Date, default: Date.now }
});

AchievementSchema.index({ userId: 1, date: 1, type: 1 }, { unique: true });

export default mongoose.model('Achievement', AchievementSchema);