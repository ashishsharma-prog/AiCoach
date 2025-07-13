const express = require('express');
const router = express.Router();

const plansRoutes = require('./plans');
const healthRoutes = require('./health');

// Mount routes
router.use('/plans', plansRoutes);
router.use('/health', healthRoutes);

module.exports = router; 