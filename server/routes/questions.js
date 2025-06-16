import express from 'express';
import Question from '../models/Question.js';
import { protect } from '../middleware/auth.js';
import { WaecQuestion } from '../models/WaecQuestion.js';

const router = express.Router();

// Get questions with filters
router.get('/', protect, async (req, res) => {
  try {
    const { examType, subject, year, type } = req.query;
    
    let filter = {};
    if (examType) filter.examType = examType;
    if (subject) filter.subject = subject;
    if (year) filter.year = parseInt(year);
    if (type) filter.questionType = type;

    const questions = await WaecQuestion.find(filter);
    res.json(questions);

  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subjects by exam type
router.get('/subjects/:examType', protect, async (req, res) => {
  try {
    const { examType } = req.params;
    
    const subjects = await WaecQuestion.distinct('subject', { examType });
    res.json(subjects);

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get years by exam type and subject
router.get('/years/:examType/:subject', protect, async (req, res) => {
  try {
    const { examType, subject } = req.params;
    
    const years = await WaecQuestion.distinct('year', { examType, subject });
    res.json(years.sort((a, b) => b - a));

  } catch (error) {
    console.error('Get years error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;