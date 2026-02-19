const request = require('supertest');
const app = require('../../server');
const { Employee } = require('../../models');

describe('Auth API', () => {
  let testEmployee;

  beforeEach(async () => {
    // Create test employee
    testEmployee = await Employee.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'sales'
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('employee');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'password123'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      token = loginRes.body.data.token;
    });

    it('should get profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile');

      expect(res.status).toBe(401);
    });
  });
});
