import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes';
import { createTestUser, createTestOrganization } from '../utils/authTestUtils';
import { UserRole } from '@prisma/client';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  describe('POST /auth/register', () => {
    test('should register new user successfully', async () => {
      const organization = await createTestOrganization();

      const userData = {
        user_name: 'Test User',
        user_email: 'newuser@example.com',
        user_password: 'password123',
        organizationId: organization.id,
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.user_email).toBe(userData.user_email);
    });

    test('should reject registration with invalid email', async () => {
      const userData = {
        user_name: 'Test User',
        user_email: 'invalid-email',
        user_password: 'password123',
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const testUser = await createTestUser({
        user_email: 'login@example.com',
        user_role: UserRole.USER,
      });

      const loginData = {
        email: testUser.user_email,
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.id).toBe(testUser.id);
    });

    test('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout authenticated user', async () => {
      const testUser = await createTestUser({
        user_email: 'logout@example.com',
        user_role: UserRole.USER,
      });

      // First login to get token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.user_email,
          password: 'testpassword123',
        });

      const token = loginResponse.body.token;

      // Then logout
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    test('should reject logout without authentication', async () => {
      await request(app)
        .post('/auth/logout')
        .expect(401);
    });
  });
});