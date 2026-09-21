import express from 'express';
import {
  getProfile,
  updateProfile,
  getUser,
  testNotification,
} from '../controllers/userProfileController.js';

const router = express.Router();

// Profile endpoints (supports both authenticated /profile and /profile/:userId)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/profile/:userId', getProfile);
router.put('/profile/:userId', updateProfile);

// User endpoint
router.get('/users/:userId', getUser);

// gRPC test endpoint to invoke Notification Service via gRPC
router.post('/test-notification', testNotification);

export default router;
