import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import Ad from '../models/Ad.js';
import CBTResult from '../models/CBTResult.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Configure multer for video uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Get admin dashboard stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalAds = await Ad.countDocuments();
    const activeAds = await Ad.countDocuments({ 
      isActive: true, 
      expiryDate: { $gt: new Date() } 
    });
    const totalCBTTaken = await CBTResult.countDocuments();

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const todayCBT = await CBTResult.countDocuments({ createdAt: { $gte: today } });

    // This week's stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        today: todayUsers,
        thisWeek: weekUsers
      },
      ads: {
        total: totalAds,
        active: activeAds
      },
      cbt: {
        total: totalCBTTaken,
        today: todayCBT
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', protect, admin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload ad video
router.post('/ads/upload', protect, admin, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const { title, description, credits, expiryDate } = req.body;

    if (!title || !description || !expiryDate) {
      return res.status(400).json({ message: 'Title, description, and expiry date are required' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'studymaster-ads'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Create ad record
    const ad = await Ad.create({
      title,
      description,
      videoUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      credits: parseInt(credits) || 5,
      duration: uploadResult.duration || 0,
      expiryDate: new Date(expiryDate)
    });

    res.status(201).json({
      message: 'Ad uploaded successfully',
      ad
    });

  } catch (error) {
    console.error('Upload ad error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// Get all ads
router.get('/ads', protect, admin, async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);

  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete ad
router.delete('/ads/:adId', protect, admin, async (req, res) => {
  try {
    const { adId } = req.params;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(ad.cloudinaryId, { resource_type: 'video' });
    } catch (cloudinaryError) {
      console.log('Cloudinary deletion failed:', cloudinaryError);
    }

    await Ad.findByIdAndDelete(adId);
    res.json({ message: 'Ad deleted successfully' });

  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle ad status
router.patch('/ads/:adId/toggle', protect, admin, async (req, res) => {
  try {
    const { adId } = req.params;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    ad.isActive = !ad.isActive;
    await ad.save();

    res.json({
      message: `Ad ${ad.isActive ? 'activated' : 'deactivated'} successfully`,
      ad
    });

  } catch (error) {
    console.error('Toggle ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;