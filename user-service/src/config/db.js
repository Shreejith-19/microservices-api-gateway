import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    const conn = await mongoose.connect(mongoURI);
    console.log(`User Service MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`User Service MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
