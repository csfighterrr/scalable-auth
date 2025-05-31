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
  // Send verification email with our backend callback URL
  const callbackUrl = process.env.EMAIL_VERIFY_CALLBACK_URL || 'http://localhost:3000/api/auth/verify-email/callback';
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    { emailRedirectTo: callbackUrl }
  );

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
 * Generate a JWT token for a user (access token)
 * @param {Object} user - User object with id and email
 * @returns {string} - JWT token
 */
exports.generateToken = (user) => {
  // access token expires in 1 hour
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Generate a refresh JWT token for a user
 * @param {Object} user - User object with id and email
 * @returns {string} - Refresh token
 */
exports.generateRefreshToken = (user) => {
  // refresh token expires in 3 days
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '3d' }
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

/**
 * Verify a refresh JWT token
 * @param {string} token - Refresh token
 * @returns {Object} - Decoded token payload
 */
exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Verify email with OTP token
 * @param {string} token - OTP token from email
 * @param {string} type - Token type (signup, recovery, etc.)
 * @returns {Promise<Object>} - Verification result
 */
exports.verifyOtp = async (token, type = 'signup') => {
  const { data, error } = await supabase.auth.verifyOtp({
    token,
    type,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Resend verification email
 * @param {string} email - User's email
 * @returns {Promise<void>}
 */
exports.resendVerificationEmail = async (email) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    throw error;
  }
};

/**
 * Handle email verification callback from Supabase
 * @param {string} accessToken - Access token from callback
 * @param {string} refreshToken - Refresh token from callback
 * @returns {Promise<Object>} - Session data
 */
exports.handleEmailVerification = async (accessToken, refreshToken) => {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Check if user's email is verified
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Whether email is verified
 */
exports.isEmailVerified = async (userId) => {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user.user && user.user.email_confirmed_at !== null;
};
