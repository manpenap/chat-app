// routes/chatRoutes.js
import express from 'express';
import { saveConversationController, getLastConversationController, processWelcomeMessage, processTextToSpeech, processChatMessage } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', processChatMessage);
router.post('/save-conversation', saveConversationController);
router.get('/last-conversation', getLastConversationController);
router.get('/welcome', processWelcomeMessage);
router.post('/tts', processTextToSpeech);

export default router;
