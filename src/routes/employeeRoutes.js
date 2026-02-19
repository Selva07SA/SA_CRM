const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/employees
 * @desc    Get all employees
 * @access  Private (Admin, Sales, Support)
 */
router.get(
  '/',
  validate(schemas.pagination, 'query'),
  employeeController.getAllEmployees
);

/**
 * @route   GET /api/v1/employees/:id
 * @desc    Get employee by ID
 * @access  Private (Admin, Sales, Support)
 */
router.get('/:id', employeeController.getEmployeeById);

/**
 * @route   POST /api/v1/employees
 * @desc    Create new employee
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authorize('admin'),
  validate(schemas.createEmployee),
  employeeController.createEmployee
);

/**
 * @route   PUT /api/v1/employees/:id
 * @desc    Update employee
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authorize('admin'),
  validate(schemas.updateEmployee),
  employeeController.updateEmployee
);

/**
 * @route   DELETE /api/v1/employees/:id
 * @desc    Delete employee
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize('admin'), employeeController.deleteEmployee);

module.exports = router;
