import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware for API Gateway
 * Validates incoming Bearer JWT before allowing requests to proceed to protected microservices.
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // 1. Check for Authorization header & Bearer format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or malformed Bearer token.',
    });
  }

  // 2. Extract token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token not provided.',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[API Gateway Error] JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Gateway authentication configuration error.',
    });
  }

  try {
    // 3. Verify JWT token
    const decoded = jwt.verify(token, secret);

    // 4. Attach decoded credentials to req.user for downstream proxying
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
