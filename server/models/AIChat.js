import mongoose from 'mongoose';

const aiChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'subject-specific', 'exam-prep'],
    default: 'general'
  }
}, {
  timestamps: true
});

export default mongoose.model('AIChat', aiChatSchema);