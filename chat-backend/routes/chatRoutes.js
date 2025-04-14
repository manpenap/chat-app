// chatRoutes.js
import express from 'express';
import chatController from '../controllers/chatController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/welcome', chatController.getWelcomeMessage);
router.get('/last-conversation', protect,  chatController.getLastConversation);
router.post('/save-conversation', protect, chatController.saveConversation);
router.post('/', protect, chatController.handleChat);

export default router;

