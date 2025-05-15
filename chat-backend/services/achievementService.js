import Achievement from '../models/Achievement.js';

export const grantDailyConversationAchievement = async (userId, dateStr) => {
  // dateStr debe ser YYYY-MM-DD
  try {
    await Achievement.updateOne(
      { userId, date: dateStr, type: 'daily_conversation' },
      { $setOnInsert: { userId, date: dateStr, type: 'daily_conversation' } },
      { upsert: true }
    );
  } catch (err) {
    // Si ya existe, no hacer nada
  }
};