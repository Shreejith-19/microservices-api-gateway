import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serviceConfig } from '../config/services.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Creates an HTTP reverse proxy middleware with header propagation and error handling
 * @param {string} target - Downstream service base URL
 * @param {Object} pathRewrite - Optional path rewrite rules
 */
const createServiceProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Forward authenticated user identity to downstream services
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.userId);
          proxyReq.setHeader('x-user-email', req.user.email);
        }
      },
      error: (err, req, res) => {
        console.error(
          `[Gateway Proxy Error] Target: ${target}, Path: ${req.originalUrl}, Error: ${err.message}`
        );
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: `Service unavailable at ${target}: ${err.message}`,
          });
        }
      },
    },
  });
};

// ---------------------------------------------------------------
// 1. Public Routes: Auth Service (/api/auth/*)
// ---------------------------------------------------------------
// Public endpoints (e.g. login, register) with IP-based rate limiting
router.use(
  '/api/auth',
  rateLimiter,
  createServiceProxy(serviceConfig.authServiceUrl)
);

// ---------------------------------------------------------------
// 2. Protected Routes: User Service (/api/users/*)
// ---------------------------------------------------------------
// Authenticates JWT -> Enforces Redis Rate Limit -> Proxies to User Service
router.use(
  '/api/users',
  authenticateJWT,
  rateLimiter,
  createServiceProxy(serviceConfig.userServiceUrl, {
    '^/api/users': '', // rewrites /api/users/profile -> /profile
  })
);

// ---------------------------------------------------------------
// 3. Protected Routes: Notification Service (/api/notifications/*)
// ---------------------------------------------------------------
// Authenticates JWT -> Enforces Redis Rate Limit -> Proxies to Notification Service
router.use(
  '/api/notifications',
  authenticateJWT,
  rateLimiter,
  createServiceProxy(serviceConfig.notificationServiceUrl, {
    '^/api/notifications': '', // rewrites /api/notifications/send-email -> /send-email
  })
);

export default router;
