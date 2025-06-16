import express from 'express';
import Ad from '../models/Ad.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get active ads for users
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    
    const ads = await Ad.find({
      isActive: true,
      expiryDate: { $gt: now }
    }).select('-cloudinaryId');

    // Filter out ads already watched by user
    const user = await User.findById(req.user.id);
    const watchedAdIds = user.watchedAds || [];
    
    const availableAds = ads.filter(ad => 
      !ad.watchedBy.some(watch => watch.user.toString() === req.user.id)
    );

    res.json(availableAds);

  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark ad as watched and credit user
router.post('/watch/:adId', protect, async (req, res) => {
  try {
    const { adId } = req.params;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Check if already watched
    const alreadyWatched = ad.watchedBy.some(watch => 
      watch.user.toString() === req.user.id
    );

    if (alreadyWatched) {
      return res.status(400).json({ message: 'Ad already watched' });
    }

    // Add to watched list
    ad.watchedBy.push({ user: req.user.id });
    ad.views += 1;
    await ad.save();

    // Credit user
    const user = await User.findById(req.user.id);
    user.credits += ad.credits;
    await user.save();

    res.json({
      message: 'Ad watched successfully',
      creditsEarned: ad.credits,
      totalCredits: user.credits
    });

  } catch (error) {
    console.error('Watch ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;