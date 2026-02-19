const request = require('supertest');
const app = require('../../server');
const { Employee, Client } = require('../../models');

describe('Client API', () => {
  let token;
  let testEmployee;

  beforeEach(async () => {
    // Create test employee and login
    testEmployee = await Employee.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'sales'
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = loginRes.body.data.token;
  });

  describe('POST /api/v1/clients', () => {
    it('should create a new client', async () => {
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          company: 'Test Company'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.firstName).toBe('John');
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: '',
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/clients', () => {
    beforeEach(async () => {
      await Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        assignedTo: testEmployee.id
      });
    });

    it('should get all clients', async () => {
      const res = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('clients');
      expect(res.body.data.clients.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/clients/:id', () => {
    let client;

    beforeEach(async () => {
      client = await Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        assignedTo: testEmployee.id
      });
    });

    it('should get client by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${client.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(client.id);
    });

    it('should return 404 for non-existent client', async () => {
      const res = await request(app)
        .get('/api/v1/clients/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
    });
  });
});
