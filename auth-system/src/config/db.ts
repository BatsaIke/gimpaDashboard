import mongoose from 'mongoose';

const connectDB = async (DB_URI: string): Promise<void> => {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
