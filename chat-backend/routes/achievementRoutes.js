import express from 'express';
import { getUserAchievements } from '../controllers/achievementController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint para obtener los logros del usuario autenticado
router.get('/', protect, getUserAchievements);

export default router;