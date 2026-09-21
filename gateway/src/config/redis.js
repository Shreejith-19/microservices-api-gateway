import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Reusable Redis client for API Gateway
 * Configured with non-blocking error handling and connection retries
 */
export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true, // Connect on-demand or explicitly
  enableOfflineQueue: false, // Fail fast if Redis is down rather than queuing commands
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    // If Redis is unreachable, back off up to 10 seconds and don't flood the console
    const delay = Math.min(times * 1000, 10000);
    return delay;
  },
  connectTimeout: 2000,
});

let isLoggedConnecting = false;

// Attempt initial connection without crashing the app if offline
redisClient.connect().catch((err) => {
  console.warn(`[Redis] Initial connection to ${REDIS_URL} failed (${err.message}). Gateway will continue in degraded mode.`);
});

redisClient.on('connect', () => {
  console.log(`[Redis] Connected to Redis server at ${REDIS_URL}`);
  isLoggedConnecting = false;
});

redisClient.on('ready', () => {
  console.log('[Redis] Ready to accept commands.');
});

redisClient.on('error', (err) => {
  // Log only once per disconnection cycle to prevent terminal spamming
  if (!isLoggedConnecting) {
    console.error(`[Redis Error]: Cannot connect to ${REDIS_URL} (${err.message})`);
    isLoggedConnecting = true;
  }
});

redisClient.on('close', () => {
  // connection closed
});

export default redisClient;
