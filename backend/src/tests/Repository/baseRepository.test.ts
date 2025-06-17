import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BaseRepository } from '../../../src/repository/base/BaseRepository';
import { Prisma, User } from '@prisma/client';

const mockModel = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const repo = new BaseRepository<User, Prisma.UserWhereUniqueInput, Prisma.UserCreateInput>(mockModel);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BaseRepository (User)', () => {
  it('should fetch all users', async () => {
    mockModel.findMany.mockResolvedValue([{ id: '1' }]);
    const result = await repo.findAll();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('should create a user', async () => {
    const mockUser: User = {
      id: '1',
      user_name: 'Test User',
      user_email: 'test@example.com',
      user_password: 'hashedpass',
      user_role: 'USER',
      validation_key: null,
      resetToken: null,
      resetTokenExpiry: null,
      organizationId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockModel.create.mockResolvedValue(mockUser);

    const result = await repo.create({
      user_name: 'Test User',
      user_email: 'test@example.com',
      user_password: 'hashedpass',
      user_role: 'USER',
    });

    expect(result).toEqual(mockUser);
    expect(mockModel.create).toHaveBeenCalledWith({
      data: {
        user_name: 'Test User',
        user_email: 'test@example.com',
        user_password: 'hashedpass',
        user_role: 'USER',
      },
    });
  });
});
