import { describe, test, expect } from '@jest/globals';
import {
  hasPermission,
  hasAnyPermission,
  getUserPermissions,
} from '../../authorization/utils/permissionChecker';
import { createTestUser, createTestOrganization } from '../utils/authTestUtils';
import { USER_PERMISSIONS, ADMIN_PERMISSIONS } from '../../authorization/constants/permissions'; // Import constants
import { UserRole } from '@prisma/client';

describe('Permission Checker', () => {
  describe('hasPermission', () => {
    test('should return true for valid user permission', async () => {
      const testUser = await createTestUser({
        user_email: `user-perm-${Date.now()}@example.com`,
        user_role: UserRole.USER,
      });
      const authUser = { ...testUser, user_role: testUser.user_role };
      const result = hasPermission(authUser, USER_PERMISSIONS.READ_SELF);
      expect(result).toBe(true);
    });

    test('should return false for invalid user permission', async () => {
      const testUser = await createTestUser({
        user_email: `user-invalid-perm-${Date.now()}@example.com`,
        user_role: UserRole.USER,
      });
      const authUser = { ...testUser, user_role: testUser.user_role };
      const result = hasPermission(authUser, ADMIN_PERMISSIONS.DELETE_USERS);
      expect(result).toBe(false);
    });

    test('should return true for admin permission', async () => {
      const org = await createTestOrganization(`Org-AdminPerm-${Date.now()}`);
      const testUser = await createTestUser({
        user_email: `admin-perm-${Date.now()}@example.com`,
        user_role: UserRole.ADMIN,
        organizationId: org.id,
      });
      const authUser = { ...testUser, user_role: testUser.user_role, organizationId: org.id };
      const result = hasPermission(authUser, ADMIN_PERMISSIONS.READ_USERS);
      expect(result).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    test('should return true if user has any of the permissions', async () => {
      const testUser = await createTestUser({
        user_email: `user-anyperm-${Date.now()}@example.com`,
        user_role: UserRole.USER,
      });
      const authUser = { ...testUser, user_role: testUser.user_role };
      const result = hasAnyPermission(authUser, [USER_PERMISSIONS.READ_SELF, ADMIN_PERMISSIONS.DELETE_USERS]);
      expect(result).toBe(true);
    });
  });

  describe('getUserPermissions', () => {
    test('should return correct permissions for user role', async () => {
      const testUser = await createTestUser({
        user_email: `user-getperm-${Date.now()}@example.com`,
        user_role: UserRole.USER,
      });
      const authUser = { ...testUser, user_role: testUser.user_role };
      const permissions = getUserPermissions(authUser);
      expect(permissions).toContain(USER_PERMISSIONS.READ_SELF);
      expect(permissions).toContain(USER_PERMISSIONS.CREATE_BOOKING);
      expect(permissions).not.toContain(ADMIN_PERMISSIONS.DELETE_USERS);
    });
  });
});
