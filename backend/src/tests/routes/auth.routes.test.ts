import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes';
import { createTestOrganization } from '../utils/authTestUtils';
import { errorHandler } from '../../middleware/error.middleware'; // Assuming this is your error handler

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use(errorHandler); // Use your imported error handling middleware

describe('Auth Routes Integration Tests', () => {
  const complexPassword = 'Password123!'; // Meets complexity

  describe('POST /auth/register', () => {
    test('should register new user successfully', async () => {
      const organization = await createTestOrganization(`Org-Reg-Route-${Date.now()}`);
      const userData = {
        firstName: 'Test',
        lastName: 'User Route',
        email: `newuser-route-${Date.now()}@example.com`,
        password: complexPassword, // Use complex password
        organizationId: organization.id,
      };

      const response = await request(app).post('/auth/register').send(userData).expect(201);

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.user_email).toBe(userData.email);
    });

    test('should reject registration with invalid email', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email', // This will be caught by Zod
        password: complexPassword, // Use complex password
      };

      await request(app).post('/auth/register').send(userData).expect(400);
    });
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const org = await createTestOrganization(`Org-Login-Route-${Date.now()}`);
      const userEmail = `login-route-${Date.now()}@example.com`;
      // const userPassword = 'password123Secure'; // Old password

      // Register the user first
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Login',
          lastName: 'Test',
          email: userEmail,
          password: complexPassword, // Use complex password
          organizationId: org.id,
        })
        .expect(201);

      const loginData = {
        email: userEmail,
        password: complexPassword, // Use complex password
      };

      const response = await request(app).post('/auth/login').send(loginData).expect(200);

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.user_email).toBe(loginData.email);
      // Check for HttpOnly cookie for refreshToken
      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();

      let cookieArray: string[];
      if (typeof setCookieHeader === 'string') {
        cookieArray = [setCookieHeader];
      } else if (Array.isArray(setCookieHeader)) {
        cookieArray = setCookieHeader;
      } else {
        // This case should ideally not be reached if expect(setCookieHeader).toBeDefined() passes
        // and set-cookie is either string or string[]
        cookieArray = [];
      }

      expect(cookieArray.some((cookie: string) => cookie.startsWith('refreshToken='))).toBe(true);
    });

    test('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword1!', // Use a complex but wrong password
      };

      await request(app).post('/auth/login').send(loginData).expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout authenticated user', async () => {
      const org = await createTestOrganization(`Org-Logout-Route-${Date.now()}`);
      const userEmail = `logout-route-${Date.now()}@example.com`;
      // const userPassword = 'password123Secure'; // Old password

      // Register user
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Logout',
          lastName: 'Test',
          email: userEmail,
          password: complexPassword, // Use complex password
          organizationId: org.id,
        })
        .expect(201);

      // Login to get token and cookies
      const loginResponse = await request(app).post('/auth/login').send({
        email: userEmail,
        password: complexPassword, // Use complex password
      });

      const token = loginResponse.body.data.accessToken;
      expect(token).toBeDefined();

      const agent = request.agent(app);
      // Login with agent to establish session and cookies for the agent
      await agent.post('/auth/login').send({ email: userEmail, password: complexPassword });

      await agent.post('/auth/logout').set('Authorization', `Bearer ${token}`).expect(200);
    });

    test('should reject logout without authentication', async () => {
      await request(app).post('/auth/logout').expect(401);
    });
  });
});
