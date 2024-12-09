import  LearningPathRepository  from '../repositories/learningPathRepository.js';


class LearningPathService {
  async getAllLearningPaths() {
    return await LearningPathRepository.findAll();
  }

  async getLearningPathById(id) {
    return await LearningPathRepository.findById(id);
  }

  async createLearningPath(data) {
    return await LearningPathRepository.create(data);
  }

  async updateLearningPath(id, data) {
    return await LearningPathRepository.updateById(id, data);
  }

  async deleteLearningPath(id) {
    return await LearningPathRepository.deleteById(id);
  }
}

export default new LearningPathService();
