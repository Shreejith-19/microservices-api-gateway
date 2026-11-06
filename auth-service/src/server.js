import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint exposing service and MongoDB connection state
app.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.status(isMongoConnected ? 200 : 503).json({
    status: isMongoConnected ? 'UP' : 'DEGRADED',
    service: 'auth-service',
    mongodb: {
      status: isMongoConnected ? 'CONNECTED' : 'DISCONNECTED',
      database: 'auth_db',
      host: mongoose.connection.host || 'unknown',
    },
  });
});

// Auth Routes (supports both /register and /api/auth/register)
app.use('/api/auth', authRoutes);
app.use('/', authRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});
