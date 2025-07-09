const express = require('express');
const router = express.Router();

const plansRoutes = require('./plans');
const stepsRoutes = require('./steps');
const healthRoutes = require('./health');

// Mount routes
router.use('/plans', plansRoutes);
router.use('/steps', stepsRoutes); // Simplified mounting to avoid conflicts
router.use('/health', healthRoutes);

module.exports = router; 