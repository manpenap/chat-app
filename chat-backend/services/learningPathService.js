// services/learningPathService.js
const LearningPath = require('../models/LearningPath');
const Content = require('../models/Content');

async function generateLearningPath(userId, levelCode) {
  // Verifica si el usuario ya tiene una ruta de aprendizaje
  let existingPath = await LearningPath.findOne({ userId });

  if (existingPath) {
    return existingPath;
  }

  // Obtiene todo el contenido del nivel actual
  const contents = await Content.find({ levelCode }).sort({ lessonOrder: 1 });

  // Crea módulos para la ruta de aprendizaje
  const modules = contents.map((content) => ({
    contentId: content._id,
    completed: false,
  }));

  // Crea y guarda la nueva ruta de aprendizaje
  const learningPath = new LearningPath({
    userId,
    levelCode,
    modules,
  });

  await learningPath.save();

  return learningPath;
}

module.exports = {
  generateLearningPath,
};
