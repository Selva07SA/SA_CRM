const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/leads
 * @desc    Get all leads
 * @access  Private
 */
router.get(
  '/',
  validate(schemas.pagination, 'query'),
  leadController.getAllLeads
);

/**
 * @route   GET /api/v1/leads/:id
 * @desc    Get lead by ID
 * @access  Private
 */
router.get('/:id', leadController.getLeadById);

/**
 * @route   POST /api/v1/leads
 * @desc    Create new lead
 * @access  Private
 */
router.post(
  '/',
  validate(schemas.createLead),
  leadController.createLead
);

/**
 * @route   PUT /api/v1/leads/:id
 * @desc    Update lead
 * @access  Private
 */
router.put(
  '/:id',
  validate(schemas.updateLead),
  leadController.updateLead
);

/**
 * @route   POST /api/v1/leads/:id/convert
 * @desc    Convert lead to client
 * @access  Private
 */
router.post(
  '/:id/convert',
  validate(schemas.convertLead),
  leadController.convertLead
);

/**
 * @route   DELETE /api/v1/leads/:id
 * @desc    Delete lead
 * @access  Private
 */
router.delete('/:id', leadController.deleteLead);

module.exports = router;
