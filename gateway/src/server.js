import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import net from 'net';
import gatewayRoutes from './routes/gatewayRoutes.js';
import redisClient from './config/redis.js';
import requestLogger from './middleware/requestLogger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to probe TCP connectivity directly to a MongoDB host/port with timeout
const checkMongoTcp = (host, port = 27017, timeoutMs = 1000) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isSettled = false;

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      isSettled = true;
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      if (!isSettled) {
        isSettled = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.once('error', () => {
      if (!isSettled) {
        isSettled = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.connect(port, host);
  });
};

// Allowed Origins configuration (environment-driven, avoids wildcard with credentials)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'x-user-email',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
  ],
  optionsSuccessStatus: 200,
};

// Global Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle OPTIONS preflight requests globally
app.use(requestLogger); // Structured Request Logger

// Health check endpoint for Gateway, Redis, and MongoDB dependencies
app.get('/health', async (req, res) => {
  // 1. Probe Redis Connectivity
  let redisStatus = 'DISCONNECTED';
  try {
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

  // 2. Probe MongoDB Dependency Status
  let mongoStatus = 'DISCONNECTED';
  let mongoDetails = { status: 'DISCONNECTED' };

  // Attempt A: Probe downstream auth-service health (application-level Mongoose status)
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const authRes = await fetch(`${authUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (authRes.ok) {
      const authData = await authRes.json();
      if (authData.mongodb?.status === 'CONNECTED') {
        mongoStatus = 'CONNECTED';
        mongoDetails = {
          status: 'CONNECTED',
          database: authData.mongodb.database || 'auth_db',
          host: authData.mongodb.host || 'mongodb',
          verifiedVia: 'auth-service',
        };
      }
    }
  } catch (err) {
    // Attempt B: Fallback probe user-service health
    try {
      const userUrl = process.env.USER_SERVICE_URL || 'http://localhost:5002';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const userRes = await fetch(`${userUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.mongodb?.status === 'CONNECTED') {
          mongoStatus = 'CONNECTED';
          mongoDetails = {
            status: 'CONNECTED',
            database: userData.mongodb.database || 'user_db',
            host: userData.mongodb.host || 'mongodb',
            verifiedVia: 'user-service',
          };
        }
      }
    } catch (userErr) {
      // Attempt C: Direct TCP socket probe to MongoDB host/port
      const mongoHost = process.env.MONGO_HOST || 'localhost';
      const mongoPort = parseInt(process.env.MONGO_PORT || '27017', 10);
      const isTcpUp = await checkMongoTcp(mongoHost, mongoPort, 1000);

      if (isTcpUp) {
        mongoStatus = 'CONNECTED';
        mongoDetails = {
          status: 'CONNECTED',
          host: mongoHost,
          port: mongoPort,
          verifiedVia: 'tcp-socket',
        };
      } else {
        mongoStatus = `DISCONNECTED (${err.message})`;
        mongoDetails = { status: mongoStatus };
      }
    }
  }

  const isRedisOk = redisStatus === 'CONNECTED';
  const isMongoOk = mongoStatus === 'CONNECTED';
  const isHealthy = isRedisOk && isMongoOk;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    redis: {
      status: redisStatus,
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    mongodb: {
      status: mongoStatus,
      ...mongoDetails,
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
