import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRole, PrismaClient, Organization } from '@prisma/client';
import { Request, CookieOptions } from 'express'; // Alias ExpressResponse, Import CookieOptions

const prisma = new PrismaClient();

export interface TestUser {
  id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  organizationId?: string | null;
}

// Interface for the user object attached to the Express Request
interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email: string;
  organizationId?: string | null;
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

export const createTestOrganization = async (
  name: string = 'Test Organization',
): Promise<Organization> => {
  return await prisma.organization.create({
    data: {
      org_name: name,
      org_type: 'Educational',
      org_location: 'Default Location',
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
    { expiresIn: '1h' },
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
    } as AuthenticatedUser,
  };
};

// Define a more specific type for the mock response
// It should implement the parts of Express.Response that are actually used in tests.
export interface MockResponse {
  status: jest.Mock<this, [number]>;
  json: jest.Mock<this, [unknown]>;
  send: jest.Mock<this, [unknown]>;
  sendStatus: jest.Mock<this, [number]>;
  // Add other Response properties/methods if your tests use them
  // For example, if you use res.locals, res.cookie, etc.
  locals: Record<string, unknown>; // Changed any to unknown
  cookie: jest.Mock<this, [string, string, CookieOptions?]>; // Used CookieOptions
  clearCookie: jest.Mock<this, [string, CookieOptions?]>; // Used CookieOptions
  setHeader: jest.Mock<this, [string, string | string[]]>; // Example
  getHeader: jest.Mock<string | number | string[] | undefined, [string]>; // Example
  // Ensure all methods from Express.Response that are used are explicitly defined
  // or ensure that the methods return `this` for chaining if that's the pattern.
}

export const createMockResponse = (): MockResponse => {
  const res = {
    locals: {}, // Initialize if part of the interface
    _headers: {}, // Initialize if getHeader mock relies on it and you want to set headers
  } as MockResponse & { _headers?: Record<string, string | string[] | number> };

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res); // Initialize if part of the interface
  res.clearCookie = jest.fn().mockReturnValue(res); // Initialize if part of the interface
  res.setHeader = jest.fn().mockImplementation(function (
    this: typeof res,
    key: string,
    value: string | string[],
  ) {
    if (this._headers) {
      this._headers[key.toLowerCase()] = value;
    }
    return this;
  });
  res.getHeader = jest.fn().mockImplementation(function (this: typeof res, key: string) {
    // Accessing _headers which is intentionally not part of the public MockResponse type
    return this._headers ? this._headers[key.toLowerCase()] : undefined;
  });

  return res as MockResponse; // Ensure the final return type is MockResponse
};

export const createMockNext = (): jest.Mock<void, [unknown?]> => jest.fn<void, [unknown?]>();
