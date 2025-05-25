const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { 
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset 
} = require('../middlewares/validationMiddleware');

const router = express.Router();

// Authentication routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/password-reset/request', validatePasswordResetRequest, authController.requestPasswordReset);
router.post('/password-reset', validatePasswordReset, authController.resetPassword);

module.exports = router;
