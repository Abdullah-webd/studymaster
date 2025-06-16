import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://webmastersmma:ZnojFZfnZc3wC2og@cluster0.qm8swic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;