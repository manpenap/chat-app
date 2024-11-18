// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  levelCode: String, // Nivel de inglés del usuario (e.g., 'A1', 'B1')
});

module.exports = mongoose.model('User', UserSchema);
