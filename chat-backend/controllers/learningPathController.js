import LearningPathService from '../services/learningPathService.js';


class LearningPathController {
  async getAll(req, res) {
    try {
      const learningPaths = await LearningPathService.getAllLearningPaths();
      res.json(learningPaths);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const learningPath = await LearningPathService.getLearningPathById(id);
      if (!learningPath) {
        return res.status(404).json({ message: 'Ruta de aprendizaje no encontrada' });
      }
      res.json(learningPath);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const data = req.body;
      const newLearningPath = await LearningPathService.createLearningPath(data);
      res.status(201).json(newLearningPath);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedLearningPath = await LearningPathService.updateLearningPath(id, data);
      res.json(updatedLearningPath);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await LearningPathService.deleteLearningPath(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new LearningPathController();

