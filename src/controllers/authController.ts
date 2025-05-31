import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

// Register a new user
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User already exists with this email' });
      return;
    }

    const data = await authService.registerUser(email, password);
    await userService.createUserProfile({
      id: data.user.id,
      email,
      name,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      userId: data.user.id,
    });
  } catch (err) {
    handleError(res, err);
  }
}

// Login user
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    const userData = await userService.findUserById(data.user.id);

    // create tokens
    const payload = { userId: data.user.id, email: data.user.email };
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
  } catch (err) {
    handleError(res, err);
  }
}

// Refresh access token
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    // verify refresh token
    const payload = authService.verifyRefreshToken(refreshToken);
    // issue new tokens
    const token = authService.generateToken({ userId: payload.userId, email: payload.email });
    const newRefreshToken = authService.generateRefreshToken({ userId: payload.userId, email: payload.email });
    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    handleError(res, err);
  }
}

// Logout user
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    await authService.logoutUser();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    handleError(res, err);
  }
}

// Get current user
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    // Assuming authenticateToken middleware adds userId
    const userId = (req as any).user.userId;
    const userData = await userService.findUserById(userId);
    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user: userData });
  } catch (err) {
    handleError(res, err);
  }
}

// Request password reset
export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    res.status(200).json({ message: 'Password reset email sent. Please check your email.' });
  } catch (err) {
    handleError(res, err);
  }
}

// Reset password with token
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { newPassword } = req.body;
    await authService.updatePassword(newPassword);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    handleError(res, err);
  }
}
