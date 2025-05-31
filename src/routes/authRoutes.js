const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { 
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateResendVerificationEmail
} = require('../middlewares/validationMiddleware');

const router = express.Router();

// Authentication routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
// Refresh access token
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/password-reset/request', validatePasswordResetRequest, authController.requestPasswordReset);
router.post('/password-reset', validatePasswordReset, authController.resetPassword);

// Email verification routes
router.post('/verify-email', validateEmailVerification, authController.verifyEmail);
router.post('/resend-verification', validateResendVerificationEmail, authController.resendVerificationEmail);
router.get('/verify-email/callback', authController.handleEmailVerificationCallback);

module.exports = router;
