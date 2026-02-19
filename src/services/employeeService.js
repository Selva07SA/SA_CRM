const { Employee } = require('../models');
const { Op } = require('sequelize');

class EmployeeService {
  /**
   * Get all employees with pagination
   */
  async getAllEmployees(query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search = '',
      role = '',
      isActive
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows } = await Employee.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['password'] }
    });

    return {
      employees: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id) {
    const employee = await Employee.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  /**
   * Create new employee
   */
  async createEmployee(data) {
    const existingEmployee = await Employee.findOne({ where: { email: data.email } });
    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    const employee = await Employee.create(data);
    return employee.toJSON();
  }

  /**
   * Update employee
   */
  async updateEmployee(id, data) {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    if (data.email && data.email !== employee.email) {
      const existingEmployee = await Employee.findOne({ where: { email: data.email } });
      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }
    }

    await employee.update(data);
    return employee.toJSON();
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    await employee.destroy();
    return { message: 'Employee deleted successfully' };
  }
}

module.exports = new EmployeeService();
