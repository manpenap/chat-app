// controllers/progressController.js
const LearningPath = require('../models/LearningPath');

async function getProgress(req, res) {
  const userId = req.user._id;

  const learningPath = await LearningPath.findOne({ userId });

  if (!learningPath) {
    return res.status(404).json({ message: 'Ruta de aprendizaje no encontrada.' });
  }

  const totalModules = learningPath.modules.length;
  const completedModules = learningPath.modules.filter((module) => module.completed).length;

  const progress = {
    levelCode: learningPath.levelCode,
    totalModules,
    completedModules,
    progressPercentage: ((completedModules / totalModules) * 100).toFixed(2),
  };

  res.status(200).json({ progress });
}

async function checkAndUpdateLevel(req, res) {
  const userId = req.user._id;
  const learningPath = await LearningPath.findOne({ userId });

  if (!learningPath) {
    return res.status(404).json({ message: 'Ruta de aprendizaje no encontrada.' });
  }

  const allCompleted = learningPath.modules.every((module) => module.completed);

  if (allCompleted) {
    // Lógica para determinar el siguiente nivel
    const currentLevel = learningPath.levelCode;
    const nextLevel = getNextLevel(currentLevel);

    if (nextLevel) {
      // Actualiza el nivel del usuario
      await User.updateOne({ _id: userId }, { levelCode: nextLevel });
      // Genera una nueva ruta de aprendizaje
      await generateLearningPath(userId, nextLevel);
      res.status(200).json({ message: `¡Felicidades! Has avanzado al nivel ${nextLevel}.` });
    } else {
      res.status(200).json({ message: 'Has completado todos los niveles disponibles.' });
    }
  } else {
    res.status(200).json({ message: 'Aún tienes lecciones por completar.' });
  }
}

function getNextLevel(currentLevel) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const index = levels.indexOf(currentLevel);
  return index >= 0 && index < levels.length - 1 ? levels[index + 1] : null;
}
module.exports = {
  getProgress,
  checkAndUpdateLevel,
};
