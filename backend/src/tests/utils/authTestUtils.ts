import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRole, PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export interface TestUser {
  id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  organizationId?: string | null; // Changed to allow null
}

export const createTestUser = async (
  userData: Partial<TestUser> & { user_email: string },
): Promise<TestUser> => {
  const hashedPassword = await bcrypt.hash('testpassword123', 10);

  const user = await prisma.user.create({
    data: {
      user_name: userData.user_name ?? 'Test User',
      user_email: userData.user_email,
      user_password: hashedPassword,
      user_role: userData.user_role ?? UserRole.USER,
      organizationId: userData.organizationId,
    },
  });

  return user;
};

export const createTestOrganization = async (name: string = 'Test Organization') => {
  return await prisma.organization.create({
    data: {
      org_name: name,
      org_type: 'Educational',
      org_location: 'Default Location', // Added missing required field
    },
  });
};

export const generateTestToken = (user: TestUser): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.user_email,
      role: user.user_role,
      organizationId: user.organizationId,
    },
    process.env.JWT_SECRET ?? 'test-secret',
    { expiresIn: '1h' }
  );
};

export const createAuthenticatedRequest = (user: TestUser): Partial<Request> => {
  const token = generateTestToken(user);
  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
    user: {
      id: user.id,
      email: user.user_email,
      role: user.user_role,
      organizationId: user.organizationId,
    },
  };
};

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn();