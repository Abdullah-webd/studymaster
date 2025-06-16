import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AIChat from '../models/AIChat.js';
import { protect } from '../middleware/auth.js';
import run from '../config/gemni.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

// Ask AI question
router.post('/ask', protect, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    let answer;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are an educational AI assistant for StudyMaster, an e-learning platform. 
      Answer the following question in a clear, educational manner suitable for students: ${question}`;
      
      const result = await run(prompt);
      console.log('AI response:', result);
      
      answer = result
    } catch (aiError) {
      console.log('AI service not available, using fallback response');
      answer = `I understand you're asking about: "${question}". While I'm currently unable to provide a detailed response due to technical limitations, I recommend checking your textbooks or consulting with your teachers for accurate information on this topic.`;
    }

    // Save to database
    const aiChat = await AIChat.create({
      user: req.user.id,
      question,
      answer
    });

    res.json({
      question,
      answer,
      id: aiChat._id
    });

  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get AI chat history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await AIChat.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);

  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;