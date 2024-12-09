import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  unitId: { type: String, ref: 'Unit', required: true }, // Relación con Unit
  type: { type: String, required: true },
  name: { type: String, required: true },
  content: {
    text: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }
    ]
  },
  createdAt: { type: Date, default: Date.now }
});

const Lesson = mongoose.model('Lesson', LessonSchema, 'lessons');
export default Lesson;

