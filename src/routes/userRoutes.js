const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateProfileUpdate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// User profile routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.get('/profile/:userId', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, userController.updateUserProfile);
router.delete('/profile', authenticateToken, userController.deleteUserProfile);
router.post('/profile/upload-picture', authenticateToken, userController.uploadProfilePicture);

module.exports = router;
