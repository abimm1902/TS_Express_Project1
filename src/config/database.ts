import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅  MongoDB Atlas connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected. Reconnecting...');
    });

  } catch (error) {
    console.error('❌  MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
