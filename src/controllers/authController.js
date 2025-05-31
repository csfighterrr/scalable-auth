const { handleError } = require('../utils/errorHandler');
const authService = require('../services/authService');
const userService = require('../services/userService');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Register user with Supabase Auth
    const data = await authService.registerUser(email, password);

    // Create user profile in the 'users' table
    // Since we're using Supabase Auth, we'll store a hashed version of the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await userService.createUserProfile({
      id: data.user.id,
      email,
      password: hashedPassword,
      name,
      created_at: new Date(),
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      userId: data.user.id,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const data = await authService.loginUser(email, password);

    // Get user profile
    const userData = await userService.findUserById(data.user.id);

    // Create tokens
    const payload = { id: data.user.id, email: data.user.email };
    const token = authService.generateToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);

    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Refresh access token using refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    // Verify refresh token
    const payload = authService.verifyRefreshToken(refreshToken);
    // Generate new tokens
    const token = authService.generateToken({ userId: payload.userId || payload.id, email: payload.email });
    const newRefreshToken = authService.generateRefreshToken({ userId: payload.userId || payload.id, email: payload.email });
    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    handleError(res, error);
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    await authService.logoutUser();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userData = await userService.findUserById(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: userData });
  } catch (error) {
    handleError(res, error);
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    res.status(200).json({
      message: 'Password reset email sent. Please check your email.',
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    await authService.updatePassword(newPassword);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    handleError(res, error);
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { token, type = 'signup' } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const data = await authService.verifyOtp(token, type);

    // Update user profile if verification successful
    if (data.user) {
      await userService.updateUserProfile(data.user.id, {
        email_verified: true,
        updated_at: new Date(),
      });
    }

    res.status(200).json({
      message: 'Email verified successfully',
      user: data.user,
    });
  } catch (error) {
    // Handle specific OTP errors
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return res.status(400).json({
        error: 'Verification link has expired or is invalid',
        code: 'OTP_EXPIRED',
        message: 'Please request a new verification email',
      });
    }
    handleError(res, error);
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const existingUser = await userService.findUserByEmail(email);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if already verified
    const isVerified = await authService.isEmailVerified(existingUser.id);
    if (isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    await authService.resendVerificationEmail(email);

    res.status(200).json({
      message: 'Verification email sent successfully. Please check your email.',
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Handle email verification callback
exports.handleEmailVerificationCallback = async (req, res) => {
  try {
    const { access_token, refresh_token, error: authError, error_description } = req.query;

    // Handle authentication errors from Supabase
    if (authError) {
      let errorMessage = 'Email verification failed';
      let statusCode = 400;

      switch (authError) {
        case 'access_denied':
          if (error_description && error_description.includes('expired')) {
            errorMessage = 'Verification link has expired';
            statusCode = 410; // Gone
          } else {
            errorMessage = 'Verification link is invalid or has been used';
          }
          break;
        default:
          errorMessage = error_description || 'Email verification failed';
      }

      return res.status(statusCode).json({
        error: errorMessage,
        code: authError,
        description: error_description,
        suggestion: 'Please request a new verification email'
      });
    }

    if (!access_token || !refresh_token) {
      return res.status(400).json({
        error: 'Invalid verification parameters',
        code: 'MISSING_TOKENS'
      });
    }

    // Set session with tokens
    const sessionData = await authService.handleEmailVerification(access_token, refresh_token);

    if (sessionData.user) {
      // Update user profile to mark email as verified
      await userService.updateUserProfile(sessionData.user.id, {
        email_verified: true,
        updated_at: new Date(),
      });

      // Generate token for the user
      const token = authService.generateToken({
        id: sessionData.user.id,
        email: sessionData.user.email,
      });
      
      res.status(200).json({
        message: 'Email verified successfully',
        token,
        user: {
          id: sessionData.user.id,
          email: sessionData.user.email,
          email_verified: true
        }
      });
    } else {
      res.status(400).json({
        error: 'Verification failed',
        code: 'VERIFICATION_FAILED'
      });
    }
  } catch (error) {
    console.error('Email verification callback error:', error);
    handleError(res, error);
  }
};
