const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes and utilities
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { requestLogger, errorHandler } = require('./middlewares/loggingMiddleware');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support for larger payloads for image uploads
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Auth service running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
