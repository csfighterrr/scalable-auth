const { validateUser } = require('../models/userModel');

/**
 * Middleware to validate user data in requests
 */
exports.validateUserData = (isPartial = false) => {
  return (req, res, next) => {
    const userData = req.body;
    const { isValid, errors } = validateUser(userData, isPartial);

    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

/**
 * Middleware to validate registration data
 */
exports.validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email must be valid');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!name) {
    errors.push('Name is required');
  } else if (name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware to validate login data
 */
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware to validate profile update data
 */
exports.validateProfileUpdate = (req, res, next) => {
  const updateData = req.body;
  
  // Check if any data is provided
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['No data provided for update']
    });
  }

  const { isValid, errors } = validateUser(updateData, true);

  if (!isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware to validate password reset request
 */
exports.validatePasswordResetRequest = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['Email is required']
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['Email must be valid']
    });
  }

  next();
};

/**
 * Middleware to validate password reset
 */
exports.validatePasswordReset = (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['New password is required']
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['New password must be at least 6 characters']
    });
  }

  next();
};

/**
 * Middleware to validate email verification
 */
exports.validateEmailVerification = (req, res, next) => {
  const { token, type } = req.body;

  if (!token) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['Verification token is required']
    });
  }

  if (type && !['signup', 'recovery', 'email_change'].includes(type)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['Invalid verification type']
    });
  }

  next();
};

/**
 * Middleware to validate resend verification email request
 */
exports.validateResendVerificationEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['Email is required']
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['Email must be valid']
    });
  }

  next();
};
