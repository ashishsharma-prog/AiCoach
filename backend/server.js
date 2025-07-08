const express = require('express');
require('dotenv').config();

const corsMiddleware = require('./middleware/cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { pool, initializeDatabase } = require('./config/database');
const apiRoutes = require('./routes');

const app = express();

// Log the request origin to debug (optional)
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  next();
});

// ✅ Apply CORS

app.use(corsMiddleware);
app.options('*', corsMiddleware); // Handle preflight requests
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    await pool.end();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database init failed (continuing):', err.message);
  }

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();