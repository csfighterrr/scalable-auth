/**
 * Logger utility for the application
 */

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

// Get the current environment
const environment = process.env.NODE_ENV || 'development';

/**
 * Format the message for logging
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} - Formatted log message
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] ${level}: ${message} ${metaString}`;
}

/**
 * Debug level logging
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function debug(message, meta = {}) {
  if (environment !== 'production') {
    console.debug(formatMessage(LogLevel.DEBUG, message, meta));
  }
}

/**
 * Info level logging
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function info(message, meta = {}) {
  console.info(formatMessage(LogLevel.INFO, message, meta));
}

/**
 * Warning level logging
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function warn(message, meta = {}) {
  console.warn(formatMessage(LogLevel.WARN, message, meta));
}

/**
 * Error level logging
 * @param {string} message - Log message
 * @param {Object|Error} metaOrError - Additional metadata or Error object
 */
function error(message, metaOrError = {}) {
  if (metaOrError instanceof Error) {
    const { message: errorMessage, stack, ...rest } = metaOrError;
    console.error(formatMessage(LogLevel.ERROR, message, {
      error: errorMessage,
      stack,
      ...rest
    }));
  } else {
    console.error(formatMessage(LogLevel.ERROR, message, metaOrError));
  }
}

module.exports = {
  debug,
  info,
  warn,
  error,
  LogLevel,
};
