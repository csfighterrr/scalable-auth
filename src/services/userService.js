/**
 * User service for managing user data with Supabase
 */
const supabase = require('../config/supabase');

/**
 * Find a user by their ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - User data or null
 */
exports.findUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Find a user by their email
 * @param {string} email - The user's email
 * @returns {Promise<Object>} - User data or null
 */
exports.findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
    throw error;
  }

  return data;
};

/**
 * Create a new user profile
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user
 */
exports.createUserProfile = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Update a user's profile
 * @param {string} userId - The user's ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - Updated user
 */
exports.updateUserProfile = async (userId, updateData) => {
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Delete a user's profile
 * @param {string} userId - The user's ID
 * @returns {Promise<void>}
 */
exports.deleteUserProfile = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    throw error;
  }
};
