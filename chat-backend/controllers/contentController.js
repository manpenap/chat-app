// controllers/contentController.js
const LearningPath = require('../models/LearningPath');
const Content = require('../models/Content');

async function getNextLesson(req, res) {
  const userId = req.user._id;

  // Obtiene la ruta de aprendizaje del usuario
  const learningPath = await LearningPath.findOne({ userId }).populate('modules.contentId');

  if (!learningPath) {
    return res.status(404).json({ message: 'Ruta de aprendizaje no encontrada.' });
  }

  // Encuentra el siguiente módulo no completado
  const nextModule = learningPath.modules.find((module) => !module.completed);

  if (!nextModule) {
    return res.status(200).json({ message: '¡Has completado todas las lecciones!' });
  }

  res.status(200).json({ content: nextModule.contentId });
}

async function completeLesson(req, res) {
  const userId = req.user._id;
  const { contentId } = req.body;

  // Marca la lección como completada
  await LearningPath.updateOne(
    { userId, 'modules.contentId': contentId },
    {
      $set: {
        'modules.$.completed': true,
        'modules.$.completionDate': new Date(),
      },
    }
  );

  res.status(200).json({ message: 'Lección completada exitosamente.' });
}

module.exports = {
  getNextLesson,
  completeLesson,
};
