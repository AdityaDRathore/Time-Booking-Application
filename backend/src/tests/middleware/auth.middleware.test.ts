import { describe, test, expect, beforeEach } from '@jest/globals';
import { Request, Response as ExpressResponse } from 'express'; // Alias ExpressResponse
import { authenticate, checkRole } from '../../middleware/auth.middleware';
import {
  createTestUser,
  generateTestToken,
  createMockResponse,
  createMockNext,
  MockResponse, // Import your MockResponse type
} from '../utils/authTestUtils';
import { UserRole } from '@prisma/client';

describe('Authentication Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: MockResponse; // Use MockResponse type
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = createMockResponse(); // Assigns MockResponse to MockResponse
    mockNext = createMockNext();
  });

  describe('authenticate middleware', () => {
    test('should authenticate valid JWT token', async () => {
      const testUser = await createTestUser({
        user_email: 'test@example.com',
        user_role: UserRole.USER,
      });

      const token = generateTestToken(testUser);
      mockReq.headers = { authorization: `Bearer ${token}` };

      // Cast mockRes when passing to the middleware
      await authenticate(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.id).toBe(testUser.id);
    });

    test('should reject request without token', async () => {
      mockReq.headers = {};

      await authenticate(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401); // Assert on MockResponse
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject invalid token', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401); // Assert on MockResponse
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkRole middleware', () => {
    test('should allow access for correct role', async () => {
      const testUser = await createTestUser({
        user_email: 'admin@example.com',
        user_role: UserRole.ADMIN,
      });

      mockReq.user = {
        id: testUser.id,
        email: testUser.user_email,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };

      const roleMiddleware = checkRole([UserRole.ADMIN]);
      roleMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject access for incorrect role', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
      });

      mockReq.user = {
        id: testUser.id,
        email: testUser.user_email,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };

      const roleMiddleware = checkRole([UserRole.ADMIN]);
      roleMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403); // Assert on MockResponse
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
