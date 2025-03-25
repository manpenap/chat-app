import express from 'express';
import { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword } from '../controllers/userController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile); // Ruta protegida para obtener perfil
router.put('/profile', protect, async (req, res) => {
  const { level } = req.body;

  try {
    req.user.level = level;
    await req.user.save();
    res.json({ message: 'Nivel actualizado', level: req.user.level });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el nivel.' });
  }
});

// Nuevo endpoint para recuperar contraseña
router.post('/forgot-password', forgotPassword);

export default router;
