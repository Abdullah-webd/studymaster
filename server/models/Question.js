import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true,
    enum: ['WAEC', 'NECO', 'JAMB']
  },
  subject: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['objective', 'theory']
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: String,
    required: function() {
      return this.type === 'objective';
    }
  },
  points: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);