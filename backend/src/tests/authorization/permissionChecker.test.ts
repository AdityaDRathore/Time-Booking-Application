import { describe, test, expect } from '@jest/globals';
import {
  hasPermission,
  hasAnyPermission,
  getUserPermissions,
} from '../../authorization/utils/permissionChecker';
import { createTestUser } from '../utils/authTestUtils';
import { UserRole } from '@prisma/client';

describe('Permission Checker', () => {
  describe('hasPermission', () => {
    test('should return true for valid user permission', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
      });

      const authUser = {
        ...testUser,
        user_role: testUser.user_role,
      };

      const result = hasPermission(authUser, 'READ_SELF');
      expect(result).toBe(true);
    });

    test('should return false for invalid user permission', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
      });

      const authUser = {
        ...testUser,
        user_role: testUser.user_role,
      };

      const result = hasPermission(authUser, 'DELETE_USERS');
      expect(result).toBe(false);
    });

    test('should return true for admin permission', async () => {
      const testUser = await createTestUser({
        user_email: 'admin@example.com',
        user_role: UserRole.ADMIN,
      });

      const authUser = {
        ...testUser,
        user_role: testUser.user_role,
      };

      const result = hasPermission(authUser, 'READ_USERS');
      expect(result).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    test('should return true if user has any of the permissions', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
      });

      const authUser = {
        ...testUser,
        user_role: testUser.user_role,
      };

      const result = hasAnyPermission(authUser, ['READ_SELF', 'DELETE_USERS']);
      expect(result).toBe(true);
    });
  });

  describe('getUserPermissions', () => {
    test('should return correct permissions for user role', async () => {
      const testUser = await createTestUser({
        user_email: 'user@example.com',
        user_role: UserRole.USER,
      });

      const authUser = {
        ...testUser,
        user_role: testUser.user_role,
      };

      const permissions = getUserPermissions(authUser);
      expect(permissions).toContain('READ_SELF');
      expect(permissions).toContain('CREATE_BOOKING');
      expect(permissions).not.toContain('DELETE_USERS');
    });
  });
});
