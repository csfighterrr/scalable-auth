const logger = require('./logger');

/**
 * Handle errors and send appropriate responses
 */
exports.handleError = (res, error) => {
  logger.error('Request error', error);

  // Handle Supabase-specific errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation in PostgreSQL
        return res.status(409).json({ error: 'Resource already exists' });
      case 'P0001': // PostgreSQL raised exception
        return res.status(400).json({ error: error.message || 'Database constraint violation' });
      case '22P02': // Invalid text representation
        return res.status(400).json({ error: 'Invalid input format' });
      default:
        // Log the error code for future handling
        logger.error(`Unhandled error code: ${error.code}`, error);
    }
  }

  // Handle authentication errors from Supabase
  if (error.status) {
    switch (error.status) {
      case 400:
        return res.status(400).json({ error: error.message || 'Bad request' });
      case 401:
        return res.status(401).json({ error: error.message || 'Unauthorized' });
      case 403:
        return res.status(403).json({ error: error.message || 'Forbidden' });
      case 404:
        return res.status(404).json({ error: error.message || 'Not found' });
      case 409:
        return res.status(409).json({ error: error.message || 'Conflict' });
      case 429:
        return res.status(429).json({ error: error.message || 'Too many requests' });
    }
  }

  // Generic error handling
  res.status(500).json({
    error: error.message || 'Internal server error',
  });
};
