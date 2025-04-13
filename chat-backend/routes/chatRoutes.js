// chatRoutes.js
import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

router.get('/welcome', chatController.getWelcomeMessage);
router.get('/last-conversation', verifyToken, chatController.getLastConversation);
router.post('/save-conversation', chatController.saveConversation);
router.post('/', chatController.handleChat);

export default router;

