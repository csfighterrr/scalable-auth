/**
 * Authentication service for managing authentication with Supabase
 */
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * Register a new user with Supabase Auth
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Registration data
 */
exports.registerUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Login a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Login data
 */
exports.loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Log out the current user
 * @returns {Promise<void>}
 */
exports.logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

/**
 * Get the current user's session
 * @returns {Promise<Object>} - User session
 */
exports.getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Request a password reset email
 * @param {string} email - User's email
 * @returns {Promise<void>}
 */
exports.requestPasswordReset = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    throw error;
  }
};

/**
 * Update user's password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Updated user
 */
exports.updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id and email
 * @returns {string} - JWT token
 */
exports.generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
