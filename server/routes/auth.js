import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '30d'
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@gmail.com',
    pass: process.env.EMAIL_PASS || 'testpass'
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      phone,
      password,
      otp: {
        code: otp,
        expires: otpExpires
      }
    });

    // Send OTP email (in production, use real email service)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'webmastersmma@gmail.com',
        to: email,
        subject: 'StudyMaster - Email Verification',
        html: `
          <h2>Welcome to StudyMaster!</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      });
    } catch (emailError) {
      console.log('Email service not configured, OTP:', otp);
    }

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      userId: user._id,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (!user.otp.code || user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otp.expires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        credits: user.credits
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;