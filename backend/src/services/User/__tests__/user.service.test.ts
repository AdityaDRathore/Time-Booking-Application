// ✅ Step 1: Mock the transaction module and define mock data
jest.mock('../../../repository/base/transaction', () => {
  const { UserRole } = require('@prisma/client');

  const mockUser = {
    id: '1',
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

  const mockUserModel = {
    findMany: jest.fn().mockResolvedValue([mockUser]),
    findUnique: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ ...mockUser, user_name: 'Updated Alice' }),
    delete: jest.fn().mockResolvedValue(mockUser),
  };

  return {
    prisma: {
      user: mockUserModel,
    },
  };
});

// ✅ Step 2: Import after mocking
import { UserService } from '../user.service';
import { UserRole } from '@prisma/client';
import { prisma as mockedPrisma } from '../../../repository/base/transaction';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    jest.clearAllMocks();
  });

  it('should get all users', async () => {
    const users = await service.getAllUsers();
    expect(users.length).toBe(1);
    expect(mockedPrisma.user.findMany).toHaveBeenCalled();
  });

  it('should get user by ID', async () => {
    const user = await service.getUserById('1');
    expect(user?.user_name).toBe('Alice');
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should create a user', async () => {
    const user = await service.createUser({
      user_email: 'alice@example.com',
      user_name: 'Alice',
      user_role: UserRole.USER,
    });
    expect(user.user_name).toBe('Alice');
    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: {
        user_email: 'alice@example.com',
        user_name: 'Alice',
        user_role: UserRole.USER,
      },
    });
  });

  it('should update a user', async () => {
    const user = await service.updateUser('1', { user_name: 'Updated Alice' });
    expect(user.user_name).toBe('Updated Alice');
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { user_name: 'Updated Alice' },
    });
  });

  it('should delete a user', async () => {
    const user = await service.deleteUser('1');
    expect(user.id).toBe('1');
    expect(mockedPrisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('alice@example.com');
    expect(user?.user_email).toBe('alice@example.com');
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { user_email: 'alice@example.com' },
    });
  });

  it('should search users', async () => {
    const users = await service.searchUsers('Ali', UserRole.USER);
    expect(users.length).toBe(1);
    expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { user_name: { contains: 'Ali', mode: 'insensitive' } },
          { user_role: UserRole.USER },
        ],
      },
      orderBy: { user_name: 'asc' },
    });
  });
});
