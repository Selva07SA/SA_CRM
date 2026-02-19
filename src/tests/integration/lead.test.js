const request = require('supertest');
const app = require('../../server');
const { Employee, Lead, Client } = require('../../models');

describe('Lead API', () => {
  let token;
  let testEmployee;

  beforeEach(async () => {
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

  describe('POST /api/v1/leads', () => {
    it('should create a new lead', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: 'new'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('new');
    });
  });

  describe('POST /api/v1/leads/:id/convert', () => {
    let lead;

    beforeEach(async () => {
      lead = await Lead.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        status: 'qualified',
        assignedTo: testEmployee.id
      });
    });

    it('should convert lead to client', async () => {
      const res = await request(app)
        .post(`/api/v1/leads/${lead.id}/convert`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lead.status).toBe('converted');
      expect(res.body.data).toHaveProperty('client');
    });
  });
});
