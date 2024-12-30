import express from 'express';
import LearningPathController from '../controllers/learningPathController.js';


const router = express.Router();

router.get('/', LearningPathController.getAll);
router.get('/level/:id_path', LearningPathController.getById);
router.post('/', LearningPathController.create);
router.put('/:id', LearningPathController.update);
router.delete('/:id', LearningPathController.delete);

export default router;

