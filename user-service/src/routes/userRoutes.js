import express from 'express';
import {
  getProfile,
  updateProfile,
  getUser,
} from '../controllers/userProfileController.js';

const router = express.Router();

// Profile endpoints
router.get('/profile/:userId', getProfile);
router.put('/profile/:userId', updateProfile);

// User endpoint
router.get('/users/:userId', getUser);

export default router;
