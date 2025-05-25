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
    await userService.createUserProfile({
      id: data.user.id,
      email,
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

    // Create JWT token
    const token = authService.generateToken({
      id: data.user.id,
      email: data.user.email,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
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
