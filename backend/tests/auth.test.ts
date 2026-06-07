import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/lib/prisma.js';

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    role: 'CUSTOMER'
  };

  beforeAll(async () => {
    // Clean up test user if it exists
    await prisma.user.deleteMany({
      where: {
        email: testUser.email
      }
    });
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: {
        email: testUser.email
      }
    });
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).not.toHaveProperty('password_hash');
  });

  it('should not register a user with an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(500); // Controller returns 500 on catch-all for registration failed
    // Depending on implementation, it might be 400 or 409 if handled specifically, 
    // but authController.ts shows res.status(500).json({ message }) in catch.
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('should return 400 if missing fields on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'missing@example.com'
      });

    expect(res.statusCode).toBe(400);
  });
});
