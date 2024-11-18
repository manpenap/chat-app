// models/LearningPath.js
const mongoose = require('mongoose');

const LearningPathSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  levelCode: String,
  modules: [
    {
      contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
      completed: { type: Boolean, default: false },
      completionDate: Date,
    },
  ],
});

module.exports = mongoose.model('LearningPath', LearningPathSchema);
