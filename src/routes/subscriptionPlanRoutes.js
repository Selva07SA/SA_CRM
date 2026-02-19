const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/subscription-plans
 * @desc    Get all subscription plans
 * @access  Private
 */
router.get(
  '/',
  validate(schemas.pagination, 'query'),
  subscriptionPlanController.getAllPlans
);

/**
 * @route   GET /api/v1/subscription-plans/:id
 * @desc    Get subscription plan by ID
 * @access  Private
 */
router.get('/:id', subscriptionPlanController.getPlanById);

/**
 * @route   POST /api/v1/subscription-plans
 * @desc    Create new subscription plan
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authorize('admin'),
  validate(schemas.createSubscriptionPlan),
  subscriptionPlanController.createPlan
);

/**
 * @route   PUT /api/v1/subscription-plans/:id
 * @desc    Update subscription plan
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authorize('admin'),
  validate(schemas.updateSubscriptionPlan),
  subscriptionPlanController.updatePlan
);

/**
 * @route   DELETE /api/v1/subscription-plans/:id
 * @desc    Delete subscription plan
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize('admin'), subscriptionPlanController.deletePlan);

module.exports = router;
