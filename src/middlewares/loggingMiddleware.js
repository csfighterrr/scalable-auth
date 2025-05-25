const logger = require('../utils/logger');

/**
 * Middleware to log incoming requests
 */
exports.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log the incoming request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Add response logging
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    
    return originalSend.call(this, body);
  };

  next();
};

/**
 * Middleware to handle uncaught errors
 */
exports.errorHandler = (err, req, res, next) => {
  logger.error('Uncaught error', err);
  res.status(500).json({ error: 'Internal server error' });
};
