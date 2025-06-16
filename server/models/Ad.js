import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 5
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  watchedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Ad', adSchema);