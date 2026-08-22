import { verifyToken } from '../services/jwtService.js';

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // 1. Check if Authorization header is present and properly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or malformed Bearer token.',
    });
  }

  // 2. Extract token from header ("Bearer <token>")
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token not provided.',
    });
  }

  try {
    // 3. Verify token and extract payload
    const decoded = verifyToken(token);

    // 4. Attach extracted userId and email to req.user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Authorization failed.',
    });
  }
};
