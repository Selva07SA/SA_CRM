const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Employee } = require('../models');

class AuthService {
  /**
   * Login employee
   */
  async login(email, password) {
    const employee = await Employee.findOne({ where: { email } });

    if (!employee) {
      throw new Error('Invalid email or password');
    }

    if (!employee.isActive) {
      throw new Error('Account is inactive');
    }

    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      employee: employee.toJSON()
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(employee) {
    return jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
