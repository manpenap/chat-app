import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autorizado, se requiere un token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); // Asegúrate de usar "id" si ese es el campo decodificado

    if (!req.user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Token no válido o expirado.' });
  }
};

export default protect;

