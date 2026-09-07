import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gatewayRoutes from './routes/gatewayRoutes.js';
import redisClient from './config/redis.js';
import requestLogger from './middleware/requestLogger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(cors());
app.use(requestLogger); // Structured Request Logger

// Health check endpoint for Gateway and Redis connectivity
app.get('/health', async (req, res) => {
  let redisStatus = 'DISCONNECTED';
  try {
    // 1-second timeout so healthcheck returns immediately even if Redis is offline
    const pingPromise = redisClient.ping();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out')), 1000)
    );

    const ping = await Promise.race([pingPromise, timeoutPromise]);
    if (ping === 'PONG') {
      redisStatus = 'CONNECTED';
    }
  } catch (error) {
    redisStatus = `DISCONNECTED (${error.message})`;
  }

  const isHealthy = redisStatus === 'CONNECTED';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    redis: {
      status: redisStatus,
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
  });
});

// Mount Reverse Proxy Routes
// (Mounted before express.json() to allow streaming request payloads directly)
app.use(gatewayRoutes);

// Fallback 404 Route for unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Gateway route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
