import Achievement from '../models/Achievement.js';

export const getUserAchievements = async (req, res) => {
  const userId = req.user._id;
  const achievements = await Achievement.find({ userId }).sort({ date: 1 });
  res.json({ achievements });
};