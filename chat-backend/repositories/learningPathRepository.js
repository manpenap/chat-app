import LearningPath from '../models/LearningPath.js';
import Unit from '../models/Unit.js';
import Lesson from '../models/Lesson.js';

class LearningPathRepository {
  async findAll() {
    return await LearningPath.find(); // Retorna todas las unidades
  }

  async findById(id) {
        // Obtener el learningPath
        const learningPath = await LearningPath.findOne({ _id: id });
        if (!learningPath) return null;
    
        // Obtener las unidades asociadas
        const units = await Unit.find({ _id: { $in: learningPath.unitIds } });
    
        // Para cada unidad, obtener las lecciones asociadas
        for (const unit of units) {
          unit.lessons = await Lesson.find({ _id: { $in: unit.lessonIds } });
        }
    
        // Construir la respuesta enriquecida
        return {
          ...learningPath.toObject(),
          units: units.map(unit => ({
            ...unit.toObject(),
            lessons: unit.lessons.map(lesson => lesson.toObject())
          }))
        };
  }

  async create(data) {
    const learningPath = new LearningPath(data);
    return await learningPath.save(); // Crea una nueva unidad
  }

  async updateById(id, data) {
    return await LearningPath.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return await LearningPath.findByIdAndDelete(id);
  }
}

export default new LearningPathRepository();
