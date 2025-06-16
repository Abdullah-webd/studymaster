import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user by phone number
router.get('/search/:phone', protect, async (req, res) => {
  try {
    const { phone } = req.params;
    
    const user = await User.findOne({ phone }).select('_id name phone email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in contacts
    const currentUser = await User.findById(req.user.id);
    const isContact = currentUser.contacts.some(contact => 
      contact.userId.toString() === user._id.toString()
    );

    res.json({
      user,
      isContact
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add contact
router.post('/add-contact', protect, async (req, res) => {
  try {
    const { contactId } = req.body;

    const user = await User.findById(req.user.id);
    const contact = await User.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if already in contacts
    const isAlreadyContact = user.contacts.some(c => 
      c.userId.toString() === contactId
    );

    if (isAlreadyContact) {
      return res.status(400).json({ message: 'User already in contacts' });
    }

    user.contacts.push({ userId: contactId });
    await user.save();

    res.json({ message: 'Contact added successfully' });

  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user contacts
router.get('/contacts', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('contacts.userId', 'name email phone');

    res.json(user.contacts);

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;