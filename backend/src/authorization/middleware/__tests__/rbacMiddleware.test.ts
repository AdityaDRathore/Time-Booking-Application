import { Request, Response } from 'express';
import { checkPermission as requirePermissions, requireRoles, requireAny, RequestUser } from '../rbacMiddleware';
import { UserRole } from '@prisma/client';
import { USER_PERMISSIONS, ADMIN_PERMISSIONS } from '../../constants/permissions';
import { HttpException } from '../../../exceptions/HttpException';

// Mock request, response, and next function
const mockRequest = (user?: RequestUser): Partial<Request> => ({
  // Use RequestUser
  user,
});

const mockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const mockNext = jest.fn();

describe('RBAC Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requirePermissions', () => {
    it('should call next() if user has all required permissions', () => {
      const req = mockRequest({
        id: '123',
        role: UserRole.ADMIN, // Uses 'role' as per RequestUser
      }) as Request;

      const res = mockResponse() as Response;
      const middleware = requirePermissions([ADMIN_PERMISSIONS.READ_USERS]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should call next() with HttpException if user does not have required permissions', () => {
      const req = mockRequest({
        id: '123',
        role: UserRole.USER, // Uses 'role'
      }) as Request;

      const res = mockResponse() as Response;
      const middleware = requirePermissions([ADMIN_PERMISSIONS.READ_USERS]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
      expect(mockNext.mock.calls[0][0].status).toBe(403);
    });

    it('should call next() with HttpException if user is not authenticated', () => {
      const req = mockRequest() as Request; // No user
      const res = mockResponse() as Response;
      const middleware = requirePermissions([USER_PERMISSIONS.READ_LABS]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
      expect(mockNext.mock.calls[0][0].status).toBe(401);
    });
  });

  describe('requireRoles', () => {
    it('should call next() if user has the required role', () => {
      const req = mockRequest({
        id: '123',
        role: UserRole.ADMIN, // Uses 'role'
      }) as Request;

      const res = mockResponse() as Response;
      const middleware = requireRoles([UserRole.ADMIN]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should call next() with HttpException if user does not have the required role', () => {
      const req = mockRequest({
        id: '123',
        role: UserRole.USER, // Uses 'role'
      }) as Request;

      const res = mockResponse() as Response;
      const middleware = requireRoles([UserRole.ADMIN]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
      expect(mockNext.mock.calls[0][0].status).toBe(403);
    });
  });

  describe('requireAny', () => {
    it('should call next() if user has any of the required permissions', () => {
      const req = mockRequest({
        id: '123',
        role: UserRole.USER, // Uses 'role'
      }) as Request;

      const res = mockResponse() as Response;
      const middleware = requireAny([USER_PERMISSIONS.READ_LABS, ADMIN_PERMISSIONS.READ_USERS]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should call next() if user has any of the required roles', () => {
      const req = mockRequest({
        id: '123',
        role: UserRole.USER, // Uses 'role'
      }) as Request;

      const res = mockResponse() as Response;
      const middleware = requireAny([UserRole.USER, UserRole.ADMIN]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should call next() with HttpException if user does not have any of the required permissions or roles', () => {
      const req = mockRequest({
        id: '123',
        role: UserRole.USER, // Uses 'role'
      }) as Request;

      const res = mockResponse() as Response;
      const middleware = requireAny([ADMIN_PERMISSIONS.READ_USERS, UserRole.ADMIN]);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
      expect(mockNext.mock.calls[0][0].status).toBe(403);
    });
  });
});
