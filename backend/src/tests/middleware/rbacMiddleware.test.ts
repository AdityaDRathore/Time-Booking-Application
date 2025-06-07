import { describe, test, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import {
  requirePermissions,
  requireSameOrganization
} from '../../authorization/middleware/rbacMiddleware';
import {
  createTestUser,
  createTestOrganization,
  createMockResponse,
  createMockNext
} from '../utils/authTestUtils';
import { UserRole } from '@prisma/client';

describe('RBAC Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Response;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('requirePermissions middleware', () => {
    test('should allow access with required permissions', async () => {
      const testUser = await createTestUser({
        user_email: 'admin@example.com',
        user_role: UserRole.ADMIN,
        organizationId: 'org1',
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };

      const permissionMiddleware = requirePermissions(['READ_USERS']);
      permissionMiddleware(mockReq as Request, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should deny access without required permissions', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
        organizationId: 'org1',
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };

      const permissionMiddleware = requirePermissions(['READ_USERS']);
      permissionMiddleware(mockReq as Request, mockRes, mockNext);

      // Assuming HttpException calls mockRes.status().json() or similar
      // For this test, we check if next was called with an error
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error)); // Or more specific HttpException
      // expect(mockRes.status).toHaveBeenCalledWith(403); // This depends on how HttpException interacts with mockRes
    });
  });

  describe('requireSameOrganization middleware', () => {
    let organization: { id: string };

    beforeEach(async () => {
      organization = await createTestOrganization();
    });

    test('should allow access if user is in the same organization as target in params', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
        organizationId: organization.id,
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };
      mockReq.params = { organizationId: organization.id }; // Target organizationId from params

      const orgMiddleware = requireSameOrganization(); // Uses default 'organizationId' key
      orgMiddleware(mockReq as Request, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    test('should deny access if user is in a different organization', async () => {
      const otherOrganization = await createTestOrganization(); // Different org
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
        organizationId: organization.id, // User belongs to 'organization'
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };
      mockReq.params = { organizationId: otherOrganization.id }; // Target is 'otherOrganization'

      const orgMiddleware = requireSameOrganization();
      orgMiddleware(mockReq as Request, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 403,
        message: 'User does not belong to the target organization',
      }));
    });

    test('should deny access if target organizationId is missing from params', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
        organizationId: organization.id,
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };
      mockReq.params = {}; // No organizationId in params

      const orgMiddleware = requireSameOrganization();
      orgMiddleware(mockReq as Request, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 400,
        message: "Target organization ID not found in request parameters using key: 'organizationId'",
      }));
    });

    test('should deny access if authenticated user has no organizationId', async () => {
      const testUser = await createTestUser({ // Assume createTestUser can create a user without orgId
        user_email: 'user@example.com',
        user_role: UserRole.USER,
        organizationId: undefined, // Explicitly null or undefined
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: null, // User has no organization
      };
      mockReq.params = { organizationId: organization.id };

      const orgMiddleware = requireSameOrganization();
      orgMiddleware(mockReq as Request, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 403,
        message: 'User does not belong to any organization',
      }));
    });

    test('should deny access if user is not authenticated', async () => {
      mockReq.user = undefined; // No user on request
      mockReq.params = { organizationId: organization.id };

      const orgMiddleware = requireSameOrganization();
      orgMiddleware(mockReq as Request, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        status: 401,
        message: 'Authentication required',
      }));
    });
  });
});