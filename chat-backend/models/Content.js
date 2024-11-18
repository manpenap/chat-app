// models/Content.js
const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  levelCode: String, // Nivel CEFR (e.g., 'A1', 'B1')
  skillType: String, // 'reading', 'listening', 'speaking', 'writing'
  title: String,
  description: String,
  lessonOrder: Number,
  resourceUrl: String, // URL o path al recurso (texto, audio, video)
});

module.exports = mongoose.model('Content', ContentSchema);
