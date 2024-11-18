// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, 'tu_secreto_jwt');
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token no válido.' });
  }
};
