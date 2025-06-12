import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../user.service';
import { User, UserRole } from '@prisma/client';

// ✅ Mock user data
const mockUser: User = {
  id: '1', // ❗ Should be string
  user_name: 'Alice',
  user_email: 'alice@example.com',
  user_role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  user_password: '',
  validation_key: null,
  resetToken: null,
  resetTokenExpiry: null,
  organizationId: null,
};

// ✅ Mock the Prisma model methods
const mockUserModel = {
  findMany: vi.fn().mockResolvedValue([mockUser]),
  findUnique: vi.fn().mockResolvedValue(mockUser),
  create: vi.fn().mockResolvedValue(mockUser),
  update: vi.fn().mockResolvedValue({ ...mockUser, user_name: 'Updated Alice' }),
  delete: vi.fn().mockResolvedValue(mockUser),
};

// ✅ Mock the Prisma client
vi.mock('../../../repository/base/transaction', () => ({
  prisma: {
    user: mockUserModel,
  },
}));

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    vi.clearAllMocks();
  });

  it('should get all users', async () => {
    const users = await service.getAllUsers();
    expect(users.length).toBe(1);
    expect(mockUserModel.findMany).toHaveBeenCalled();
  });

  it('should get user by ID', async () => {
    const user = await service.getUserById(1);
    expect(user?.user_name).toBe('Alice');
    expect(mockUserModel.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should create a user', async () => {
    const user = await service.createUser({
      user_email: 'alice@example.com',
      user_name: 'Alice',
      user_role: UserRole.USER,
    });
    expect(user).toEqual(mockUser);
    expect(mockUserModel.create).toHaveBeenCalledWith({
      data: {
        user_email: 'alice@example.com',
        user_name: 'Alice',
        user_role: UserRole.USER,
      },
    });
  });

  it('should update a user', async () => {
    const user = await service.updateUser(1, { user_name: 'Updated Alice' });
    expect(user.user_name).toBe('Updated Alice');
    expect(mockUserModel.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { user_name: 'Updated Alice' }, // ✅ fixed from `name`
    });
  });

  it('should delete a user', async () => {
    const user = await service.deleteUser(1);
    expect(user).toEqual(mockUser);
    expect(mockUserModel.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('alice@example.com');
    expect(user?.user_email).toBe('alice@example.com');
    expect(mockUserModel.findUnique).toHaveBeenCalledWith({
      where: { user_email: 'alice@example.com' }, // ✅ fixed from `email`
    });
  });

  it('should search users', async () => {
    const users = await service.searchUsers('Ali', UserRole.USER);
    expect(users.length).toBe(1);
    expect(mockUserModel.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { user_name: { contains: 'Ali', mode: 'insensitive' } }, // ✅ fixed from `name`
          { user_role: UserRole.USER }, // ✅ fixed from `role: 'STUDENT'`
        ],
      },
      orderBy: { user_name: 'asc' }, // ✅ fixed from `name`
    });
  });
});
