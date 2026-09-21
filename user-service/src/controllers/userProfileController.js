import {
  findProfileByUserId,
  upsertProfileByUserId,
} from '../services/userProfileService.js';
import { sendEmailNotification } from '../services/notificationClient.js';

/**
 * @desc    Get user profile (via URL param :userId or x-user-id header from Gateway)
 * @route   GET /profile or GET /profile/:userId
 * @access  Public / Gateway Authenticated
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.headers['x-user-id'];

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid userId parameter or authenticated user header',
      });
    }

    const profile = await findProfileByUserId(userId.trim());

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `UserProfile not found for userId: ${userId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update or create user profile (via URL param :userId or x-user-id header)
 * @route   PUT /profile or PUT /profile/:userId
 * @access  Public / Gateway Authenticated
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.headers['x-user-id'];
    const { name, email, bio, profilePicture } = req.body;

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid userId parameter or authenticated user header',
      });
    }

    // Ensure at least one field is provided for update
    if (
      name === undefined &&
      email === undefined &&
      bio === undefined &&
      profilePicture === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide at least one field to update: name, email, bio, or profilePicture',
      });
    }

    const updatedProfile = await upsertProfileByUserId(userId.trim(), {
      name,
      email,
      bio,
      profilePicture,
    });

    return res.status(200).json({
      success: true,
      message: 'UserProfile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user information by userId (alias/view)
 * @route   GET /users/:userId or GET /api/users/:userId
 * @access  Public
 */
export const getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.headers['x-user-id'];

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid userId parameter or authenticated user header',
      });
    }

    const user = await findProfileByUserId(userId.trim());

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found for userId: ${userId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Test gRPC communication to Notification Service
 * @route   POST /test-notification or POST /api/test-notification
 * @access  Public
 */
export const testNotification = async (req, res, next) => {
  try {
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: recipient, subject, and message',
      });
    }

    // Call Notification Service via gRPC (No HTTP used)
    const grpcResult = await sendEmailNotification({
      recipient,
      subject,
      message,
    });

    return res.status(200).json({
      success: true,
      message: 'Notification sent via gRPC successfully',
      data: grpcResult,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: `Failed to communicate with Notification Service via gRPC: ${error.message || error.details || error}`,
    });
  }
};
