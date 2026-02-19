const employeeService = require('../services/employeeService');

class EmployeeController {
  /**
   * Get all employees
   */
  async getAllEmployees(req, res, next) {
    try {
      const result = await employeeService.getAllEmployees(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.status(200).json({
        success: true,
        data: employee
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(req, res, next) {
    try {
      const result = await employeeService.deleteEmployee(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
