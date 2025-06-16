import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import questionRoutes from './routes/questions.js';
import chatRoutes from './routes/chat.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';
import adRoutes from './routes/ads.js';
import cbtRoutes from './routes/cbt.js';
import { setupSocketIO } from './sockets/chatSocket.js';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173','https://studymaster-production.up.railway.app'],
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname, '../dist')));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist'));
});
// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'https://studymaster-production.up.railway.app'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes


app.use(cors());
app.use(express.json());

app.post('/start-call', async (req, res) => {
  try {
    const response = await axios.post('https://api.vapi.ai/call/web', req.body, {
      headers: {
        'Authorization': `Bearer 3153ed5b-12fe-47d5-a21c-13a7508f940e`,
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error starting Vapi call:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to start call' });
  }
});


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/cbt', cbtRoutes);

// Socket.IO setup
setupSocketIO(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'StudyMaster API is running!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 StudyMaster server running on port ${PORT}`);
});