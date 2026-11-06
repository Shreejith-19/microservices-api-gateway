import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to User Service Database (Isolated database: user_db)
connectDB();

const app = express();
const PORT = process.env.PORT || 5002;

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint exposing service and MongoDB connection state
app.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.status(isMongoConnected ? 200 : 503).json({
    status: isMongoConnected ? 'UP' : 'DEGRADED',
    service: 'user-service',
    mongodb: {
      status: isMongoConnected ? 'CONNECTED' : 'DISCONNECTED',
      database: 'user_db',
      host: mongoose.connection.host || 'unknown',
    },
  });
});

// User Service Routes
app.use('/api', userRoutes);
app.use('/', userRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
