import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startGrpcServer } from './grpc/grpcServer.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'notification-service' });
});

// Notification HTTP Routes
app.use('/api', notificationRoutes);
app.use('/', notificationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// 1. Start HTTP Server
app.listen(PORT, () => {
  console.log(`Notification Service HTTP is running on port ${PORT}`);
});

// 2. Start gRPC Server
startGrpcServer();
