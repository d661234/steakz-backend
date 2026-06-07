import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/lib/prisma.js';

describe('Admin Endpoints', () => {
  let adminToken: string;
  let customerToken: string;

  const adminUser = {
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'ADMIN'
  };

  const regularUser = {
    email: 'customer@example.com',
    password: 'customerpassword',
    role: 'CUSTOMER'
  };

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [adminUser.email, regularUser.email]
        }
      }
    });

    // Register admin
    await request(app).post('/api/auth/register').send(adminUser);
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
      password: adminUser.password
    });
    adminToken = adminLogin.body.token;

    // Register regular user
    await request(app).post('/api/auth/register').send(regularUser);
    const customerLogin = await request(app).post('/api/auth/login').send({
      email: regularUser.email,
      password: regularUser.password
    });
    customerToken = customerLogin.body.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [adminUser.email, regularUser.email]
        }
      }
    });
    await prisma.$disconnect();
  });

  it('should allow ADMIN to list users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should not allow CUSTOMER to list users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: Insufficient permissions');
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/api/admin/users');

    expect(res.statusCode).toBe(401);
  });
});
