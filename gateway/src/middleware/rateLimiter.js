import redisClient from '../config/redis.js';

/**
 * Factory to create a Redis-backed distributed rate limiter middleware
 * @param {Object} options - Configuration overrides
 * @param {number} [options.windowSeconds] - Time window in seconds (default: RATE_LIMIT_WINDOW or 60)
 * @param {number} [options.maxRequests] - Maximum allowed requests in window (default: RATE_LIMIT_MAX_REQUESTS or 100)
 */
export const createRateLimiter = (options = {}) => {
  return async (req, res, next) => {
    const windowSeconds =
      options.windowSeconds ||
      parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10);
    const maxRequests =
      options.maxRequests ||
      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

    // 1. Identify client by Authenticated User ID or Client IP
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const identifier = req.user?.userId
      ? `user:${req.user.userId}`
      : `ip:${clientIp}`;

    const key = `ratelimit:${identifier}`;

    try {
      // 2. Atomically increment counter and fetch key TTL in a single Redis pipeline
      const results = await redisClient
        .multi()
        .incr(key)
        .ttl(key)
        .exec();

      if (!results || results.length < 2) {
        return next();
      }

      const [incrErr, currentCount] = results[0];
      const [ttlErr, rawTtl] = results[1];

      if (incrErr) {
        throw incrErr;
      }

      let ttl = rawTtl;

      // 3. Set TTL on first request or if key currently has no expiry
      if (currentCount === 1 || ttl < 0) {
        await redisClient.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      const remaining = Math.max(0, maxRequests - currentCount);

      // 4. Attach standard RateLimit headers to response
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', ttl);

      // 5. Exceeded threshold check (HTTP 429)
      if (currentCount > maxRequests) {
        res.setHeader('Retry-After', ttl);
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
          retryAfter: `${ttl} seconds`,
        });
      }

      next();
    } catch (error) {
      // Graceful fallback: If Redis is offline, allow request to proceed (fail-open)
      console.warn(
        `[RateLimiter Warning] Redis unavailable, bypassing limit: ${error.message}`
      );
      next();
    }
  };
};

export const rateLimiter = createRateLimiter();
export default rateLimiter;
