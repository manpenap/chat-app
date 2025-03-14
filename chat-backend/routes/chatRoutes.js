// chatRoutes.js
import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/evaluate-grammar', chatController.evaluateGrammar);
router.get('/welcome', chatController.getWelcomeMessage);
router.get('/last-conversation', chatController.getLastConversation);
router.post('/save-conversation', chatController.saveConversation);
router.post('/', chatController.handleChat);

export default router;

