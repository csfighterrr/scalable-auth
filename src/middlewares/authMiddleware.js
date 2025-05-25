const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');

exports.authenticateToken = async (req, res, next) => {
  try {
    // Get the token from the header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = decoded; // Store user information in the request
      next();
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Optional: Check if user is an admin
exports.requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      return handleError(res, error);
    }

    if (!data || data.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required' });
    }

    next();
  } catch (error) {
    handleError(res, error);
  }
};
