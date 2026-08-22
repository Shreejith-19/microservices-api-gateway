import {
  findProfileByUserId,
  upsertProfileByUserId,
} from '../services/userProfileService.js';

/**
 * @desc    Get user profile by userId
 * @route   GET /profile/:userId or GET /api/profile/:userId
 * @access  Public
 */
export const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid userId parameter',
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
 * @desc    Update or create user profile by userId
 * @route   PUT /profile/:userId or PUT /api/profile/:userId
 * @access  Public
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, email, bio, profilePicture } = req.body;

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid userId parameter',
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
    const { userId } = req.params;

    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid userId parameter',
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
