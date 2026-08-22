import express from 'express';
import { register, login, getProtected } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route (requires valid JWT)
router.get('/protected', authenticateToken, getProtected);

export default router;
