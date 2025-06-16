import express from 'express';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user chats
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'name email phone')
    .populate('lastMessage.sender', 'name')
    .sort({ updatedAt: -1 });

    res.json(chats);

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email phone')
      .populate('messages.sender', 'name');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => 
      p._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(chat);

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or get chat
router.post('/create', protect, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] }
    }).populate('participants', 'name email phone');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.id, participantId]
      });
      
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name email phone');
    }

    res.json(chat);

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;