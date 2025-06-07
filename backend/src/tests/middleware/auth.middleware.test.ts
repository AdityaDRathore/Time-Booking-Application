import { describe, test, expect, beforeEach } from '@jest/globals';
import { Request, Response as ExpressResponse } from 'express'; // Alias ExpressResponse
import { authenticate, checkRole } from '../../middleware/auth.middleware';
import {
  createTestUser,
  generateTestToken,
  createMockResponse,
  createMockNext,
  MockResponse,
  createTestOrganization,
  TestUser, // Import TestUser type
} from '../utils/authTestUtils';
import { UserRole, Organization } from '@prisma/client'; // Import Organization

describe('Authentication Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: MockResponse;
  let mockNext: jest.Mock;
  let testOrg: Organization; // To hold created organization

  beforeEach(async () => {
    mockReq = {};
    mockRes = createMockResponse();
    mockNext = createMockNext();
    // Create a common organization for tests in this suite
    testOrg = await createTestOrganization(`AuthMiddlewareTestOrg-${Date.now()}`);
  });

  describe('authenticate middleware', () => {
    test('should authenticate valid JWT token', async () => {
      const testUser = await createTestUser({
        user_email: `auth-mid-user-${Date.now()}@example.com`,
        user_role: UserRole.USER,
        organizationId: testOrg.id, // Provide organizationId
      });
      const token = generateTestToken(testUser);
      mockReq.headers = { authorization: `Bearer ${token}` };

      await authenticate(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.id).toBe(testUser.id);
      expect(mockReq.user?.organizationId).toBe(testOrg.id);
    });

    test('should return 401 if no token is provided', async () => {
      mockReq.headers = {};

      await authenticate(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401); // Assert on MockResponse
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401); // Assert on MockResponse
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if user not found', async () => {
      // Create a user payload for a token, but don't create the user in DB
      const nonExistentUserPayload: TestUser = {
        // Use TestUser type
        id: 'non-existent-user-id',
        user_name: 'Ghost User', // Add user_name as it's part of TestUser
        user_email: `ghost-${Date.now()}@example.com`,
        user_role: UserRole.USER,
        organizationId: testOrg.id,
      };
      const token = generateTestToken(nonExistentUserPayload); // No 'as any' needed
      mockReq.headers = { authorization: `Bearer ${token}` };

      await authenticate(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      // Adjust to match the actual error response structure from sendError
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        }),
      });
    });
  });

  describe('checkRole middleware', () => {
    test('should allow access for correct role', async () => {
      const adminUser = await createTestUser({
        user_email: `auth-mid-admin-${Date.now()}@example.com`,
        user_role: UserRole.ADMIN,
        organizationId: testOrg.id, // Provide organizationId
      });
      mockReq.user = {
        id: adminUser.id,
        role: adminUser.user_role,
        organizationId: adminUser.organizationId,
      };
      const adminOnlyMiddleware = checkRole([UserRole.ADMIN]);

      adminOnlyMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject access for incorrect role', async () => {
      const regularUser = await createTestUser({
        user_email: `auth-mid-norole-${Date.now()}@example.com`,
        user_role: UserRole.USER,
        organizationId: testOrg.id, // Provide organizationId
      });
      mockReq.user = {
        id: regularUser.id,
        role: regularUser.user_role,
        organizationId: regularUser.organizationId,
      };
      const adminOnlyMiddleware = checkRole([UserRole.ADMIN]);

      adminOnlyMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403); // Or 403 for Forbidden
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
