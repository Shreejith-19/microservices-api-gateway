import express from 'express';
import { sendEmail } from '../controllers/notificationController.js';

const router = express.Router();

// Notification endpoints
router.post('/send-email', sendEmail);

export default router;
