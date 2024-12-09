// routes/index.js
import express from 'express';
import chatRoutes from './chatRoutes.js';
import learningPathRoutes from './learningPathRoutes.js';
// Aquí puedes importar más rutas en el futuro
// import userRoutes from './userRoutes.js';

const router = express.Router();

// Registrar rutas específicas
router.use('/chat', chatRoutes);
router.use('/learning-path', learningPathRoutes);
// router.use('/users', userRoutes);

export default router;
