const authService = require('../../../services/authService');
const { Employee } = require('../../../models');

describe('AuthService', () => {
  describe('login', () => {
    let testEmployee;

    beforeEach(async () => {
      testEmployee = await Employee.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'sales'
      });
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login('test@example.com', 'password123');
      
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('employee');
      expect(result.employee.email).toBe('test@example.com');
    });

    it('should throw error with invalid email', async () => {
      await expect(
        authService.login('wrong@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with invalid password', async () => {
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
