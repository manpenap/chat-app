import mongoose from 'mongoose';

const LearningPathSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  unitIds: [{ type: String, ref: 'Unit' }], // Referencia a unidades
  createdAt: { type: Date, default: Date.now }
});

const LearningPath = mongoose.model('LearningPath', LearningPathSchema, 'learningPaths');
export default LearningPath;

