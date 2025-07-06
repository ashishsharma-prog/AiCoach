const express = require('express');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import middleware
const corsMiddleware = require('./middleware/cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import database configuration
const { pool, initializeDatabase } = require('./config/database');

// Import routes
const apiRoutes = require('./routes');

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS enabled for: http://localhost:3000, http://localhost:3001, http://localhost:5173, http://localhost:5174`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 