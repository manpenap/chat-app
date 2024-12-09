import mongoose from 'mongoose';

const UnitSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  pathId: { type: String, ref: 'LearningPath', required: true }, // Relación con LearningPath
  name: { type: String, required: true },
  objective: { type: String, required: true },
  lessonIds: [{ type: String, ref: 'Lesson' }], // Referencia a lecciones
  createdAt: { type: Date, default: Date.now }
});

const Unit = mongoose.model('Unit', UnitSchema, 'units');
export default Unit;
