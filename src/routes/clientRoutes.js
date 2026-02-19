const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/clients
 * @desc    Get all clients
 * @access  Private
 */
router.get(
  '/',
  validate(schemas.pagination, 'query'),
  clientController.getAllClients
);

/**
 * @route   GET /api/v1/clients/:id
 * @desc    Get client by ID
 * @access  Private
 */
router.get('/:id', clientController.getClientById);

/**
 * @route   POST /api/v1/clients
 * @desc    Create new client
 * @access  Private
 */
router.post(
  '/',
  validate(schemas.createClient),
  clientController.createClient
);

/**
 * @route   PUT /api/v1/clients/:id
 * @desc    Update client
 * @access  Private
 */
router.put(
  '/:id',
  validate(schemas.updateClient),
  clientController.updateClient
);

/**
 * @route   DELETE /api/v1/clients/:id
 * @desc    Delete client
 * @access  Private
 */
router.delete('/:id', clientController.deleteClient);

module.exports = router;
