import UserProfile from '../models/UserProfile.js';

/**
 * Retrieve user profile by userId
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export const findProfileByUserId = async (userId) => {
  return await UserProfile.findOne({ userId });
};

/**
 * Create or update a user profile by userId
 * @param {string} userId
 * @param {Object} updateData - { name, email, bio, profilePicture }
 * @returns {Promise<Object>}
 */
export const upsertProfileByUserId = async (userId, updateData) => {
  const allowedUpdates = ['name', 'email', 'bio', 'profilePicture'];
  const filteredData = {};

  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  return await UserProfile.findOneAndUpdate(
    { userId },
    { $set: filteredData, $setOnInsert: { userId } },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};
