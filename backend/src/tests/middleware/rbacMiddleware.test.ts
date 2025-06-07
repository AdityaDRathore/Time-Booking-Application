import { describe, test, expect, beforeEach } from '@jest/globals';
import { Request, Response as ExpressResponse } from 'express'; // Alias ExpressResponse
import {
  requirePermissions,
  requireSameOrganization,
} from '../../authorization/middleware/rbacMiddleware';
import {
  createTestUser,
  createTestOrganization,
  createMockResponse,
  createMockNext,
  MockResponse, // Import your MockResponse type
} from '../utils/authTestUtils';
import { UserRole } from '@prisma/client';
// Import ALL_PERMISSIONS for runtime values, Permission can remain for type annotations if needed
import { ALL_PERMISSIONS } from '../../authorization/constants/permissions';

describe('RBAC Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: MockResponse; // Use MockResponse type
  let mockNext: jest.Mock;

  beforeEach(async () => {
    mockReq = {};
    mockRes = createMockResponse(); // Assigns MockResponse to MockResponse
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

      // Use ALL_PERMISSIONS for the actual permission string value
      const permissionMiddleware = requirePermissions([ALL_PERMISSIONS.READ_USERS]);
      // Cast mockRes when passing to the middleware
      permissionMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

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

      // Use ALL_PERMISSIONS for the actual permission string value
      const permissionMiddleware = requirePermissions([ALL_PERMISSIONS.READ_USERS]);
      // Cast mockRes when passing to the middleware
      permissionMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
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
      mockReq.params = { organizationId: organization.id };

      const orgMiddleware = requireSameOrganization();
      // Cast mockRes when passing to the middleware
      orgMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    test('should deny access if user is in a different organization', async () => {
      const otherOrganization = await createTestOrganization('Other Org');
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
      mockReq.params = { organizationId: otherOrganization.id };

      const orgMiddleware = requireSameOrganization();
      // Cast mockRes when passing to the middleware
      orgMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          message: 'User does not belong to the target organization',
        }),
      );
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
      mockReq.params = {};

      const orgMiddleware = requireSameOrganization();
      // Cast mockRes when passing to the middleware
      orgMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message:
            "Target organization ID not found in request parameters using key: 'organizationId'",
        }),
      );
    });

    test('should deny access if authenticated user has no organizationId', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
        organizationId: undefined,
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: null,
      };
      mockReq.params = { organizationId: organization.id };

      const orgMiddleware = requireSameOrganization();
      // Cast mockRes when passing to the middleware
      orgMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          message: 'User does not belong to any organization',
        }),
      );
    });

    test('should deny access if user is not authenticated', async () => {
      mockReq.user = undefined;
      mockReq.params = { organizationId: organization.id };

      const orgMiddleware = requireSameOrganization();
      // Cast mockRes when passing to the middleware
      orgMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          message: 'Authentication required',
        }),
      );
    });
  });
});
