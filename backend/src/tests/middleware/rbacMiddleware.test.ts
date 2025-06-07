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
import { UserRole, Organization } from '@prisma/client'; // Add Organization type
import { ALL_PERMISSIONS } from '../../authorization/constants/permissions';

describe('RBAC Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: MockResponse;
  let mockNext: jest.Mock;
  // Outer beforeEach for common mocks
  beforeEach(() => {
    mockReq = {};
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('requirePermissions middleware', () => {
    let org: Organization; // Define org here

    beforeEach(async () => { // This beforeEach is specific to this describe block
      org = await createTestOrganization('Test Org For Permissions');
    });

    test('should allow access with required permissions', async () => {
      const testUser = await createTestUser({
        user_email: `admin-permissions-${Date.now()}@example.com`, // Ensure unique email
        user_role: UserRole.ADMIN,
        organizationId: org.id, // Use the created org's ID
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };

      const permissionMiddleware = requirePermissions([ALL_PERMISSIONS.READ_USERS]);
      permissionMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    test('should deny access without required permissions', async () => {
      const testUser = await createTestUser({
        user_email: `user-permissions-${Date.now()}@example.com`, // Ensure unique email
        user_role: UserRole.USER,
        organizationId: org.id, // Use the created org's ID
      });

      mockReq.user = {
        id: testUser.id,
        role: testUser.user_role,
        organizationId: testUser.organizationId,
      };

      const permissionMiddleware = requirePermissions([ALL_PERMISSIONS.READ_USERS]);
      permissionMiddleware(mockReq as Request, mockRes as unknown as ExpressResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('requireSameOrganization middleware', () => {
    let organization: Organization; // Use Organization type

    beforeEach(async () => {
      // This organization is created for each test within this describe block
      organization = await createTestOrganization(`Test Org Same Org ${Date.now()}`);
    });

    test('should allow access if user is in the same organization as target in params', async () => {
      const testUser = await createTestUser({
        user_email: `user-same-org-${Date.now()}@example.com`,
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
      const otherOrganization = await createTestOrganization(`Other Org ${Date.now()}`);
      const testUser = await createTestUser({
        user_email: `user-diff-org-${Date.now()}@example.com`,
        user_role: UserRole.USER,
        organizationId: organization.id, // User belongs to 'organization'
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
        user_email: `user-no-param-org-${Date.now()}@example.com`,
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
      // Assuming User.organizationId is nullable. If not, this test needs adjustment.
      const testUser = await createTestUser({
        user_email: `user-no-orgid-${Date.now()}@example.com`,
        user_role: UserRole.USER,
        organizationId: null, // Explicitly set to null if schema allows
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
