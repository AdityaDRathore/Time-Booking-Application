/// <reference types="vitest" />

import { User, UserRole } from '@prisma/client';

describe('Prisma Types', () => {
  it('TypeScript recognizes Prisma types', () => {
    const userFields: Partial<User> = {
      id: 'test-id',
      user_name: 'Test User',
      user_email: 'test@example.com',
      user_password: 'hashed_password',
      user_role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(typeof userFields).toBe('object');
  });
});
