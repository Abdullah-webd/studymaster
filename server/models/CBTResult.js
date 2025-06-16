import mongoose from 'mongoose';

const cbtResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['WAEC', 'NECO', 'JAMB']
  },
  subject: {
    type: String,
    required: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number // in seconds
  }],
  score: {
    objectives: {
      total: Number,
      correct: Number,
      percentage: Number
    },
    theory: {
      total: Number,
      answered: Number
    },
    overall: {
      percentage: Number,
      grade: String
    }
  },
  timeTaken: Number, // in seconds
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('CBTResult', cbtResultSchema);