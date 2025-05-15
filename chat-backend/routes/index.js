// routes/index.js
import express from 'express';
import chatRoutes from './chatRoutes.js';
import userRoutes from './userRoutes.js'
import achievementRoutes from './achievementRoutes.js';
// Aquí puedes importar más rutas en el futuro
// import userRoutes from './userRoutes.js';

const router = express.Router();

// Registrar rutas específicas
router.use('/chat', chatRoutes);
router.use('/user',userRoutes);
router.use('/achievements', achievementRoutes);

export default router;
