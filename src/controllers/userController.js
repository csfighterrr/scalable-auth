const supabase = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');
const userService = require('../services/userService');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const userData = await userService.findUserById(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Remove sensitive information
    const { password, ...userProfile } = userData;

    res.status(200).json({ profile: userProfile });
  } catch (error) {
    handleError(res, error);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio, avatar_url, phone, address } = req.body;

    // Create an update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    updateData.updated_at = new Date();

    const updatedUser = await userService.updateUserProfile(userId, updateData);

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedUser,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete user profile
exports.deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // First, delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return handleError(res, authError);
    }

    // Then delete from users table
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return handleError(res, error);
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { image } = req.body;

    if (!image || !image.base64String || !image.filename) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(image.base64String, 'base64');
    
    // Upload to Supabase Storage
    const filePath = `profile-pictures/${userId}/${Date.now()}-${image.filename}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, buffer, {
        contentType: image.contentType || 'image/jpeg',
      });

    if (uploadError) {
      return handleError(res, uploadError);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl, updated_at: new Date() })
      .eq('id', userId);

    if (updateError) {
      return handleError(res, updateError);
    }

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      avatar_url: publicUrl,
    });
  } catch (error) {
    handleError(res, error);
  }
};
