const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/subscriptions
 * @desc    Get all subscriptions
 * @access  Private
 */
router.get(
  '/',
  validate(schemas.pagination, 'query'),
  subscriptionController.getAllSubscriptions
);

/**
 * @route   GET /api/v1/subscriptions/:id
 * @desc    Get subscription by ID
 * @access  Private
 */
router.get('/:id', subscriptionController.getSubscriptionById);

/**
 * @route   POST /api/v1/subscriptions
 * @desc    Create new subscription
 * @access  Private
 */
router.post(
  '/',
  validate(schemas.createSubscription),
  subscriptionController.createSubscription
);

/**
 * @route   PUT /api/v1/subscriptions/:id
 * @desc    Update subscription
 * @access  Private
 */
router.put(
  '/:id',
  validate(schemas.updateSubscription),
  subscriptionController.updateSubscription
);

/**
 * @route   POST /api/v1/subscriptions/:id/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/:id/cancel', subscriptionController.cancelSubscription);

/**
 * @route   POST /api/v1/subscriptions/:id/renew
 * @desc    Renew subscription
 * @access  Private
 */
router.post('/:id/renew', subscriptionController.renewSubscription);

/**
 * @route   DELETE /api/v1/subscriptions/:id
 * @desc    Delete subscription
 * @access  Private
 */
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
