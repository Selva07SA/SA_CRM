const express = require('express');
const router = express.Router();
const config = require('../config/config');

// Import route modules
const authRoutes = require('./authRoutes');
const employeeRoutes = require('./employeeRoutes');
const clientRoutes = require('./clientRoutes');
const leadRoutes = require('./leadRoutes');
const subscriptionPlanRoutes = require('./subscriptionPlanRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/clients', clientRoutes);
router.use('/leads', leadRoutes);
router.use('/subscription-plans', subscriptionPlanRoutes);
router.use('/subscriptions', subscriptionRoutes);

module.exports = router;
