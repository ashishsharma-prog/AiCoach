const express = require('express');
const router = express.Router();

const plansRoutes = require('./plans');
const stepsRoutes = require('./steps');
const healthRoutes = require('./health');

// Mount routes
router.use('/plans', plansRoutes);
router.use('/plans', stepsRoutes); // This will handle /plans/:planId/steps/:stepId
router.use('/health', healthRoutes);

module.exports = router; 