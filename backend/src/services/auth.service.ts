import { PrismaClient, User, UserRole } from '@prisma/client';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePasswords } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { AppError, errorTypes } from '../utils/errors';
import logger from '../utils/logger';
import { config } from '../config/environment';

const prisma = new PrismaClient();
const redis = config.REDIS_URL ? new Redis(config.REDIS_URL) : null;

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'user_password'>;
}

interface RegisterData {
  user_email: string;
  user_password: string;
  user_name: string;
  user_role: UserRole;
  org_name?: string;
  org_type?: string;
  org_location?: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<any> {
    const {
      user_email,
      user_password,
      user_name,
      user_role,
      org_name,
      org_type,
      org_location,
    } = data;

    logger.info(`📥 Registering new ${user_role}: ${user_email}`);

    const existingUser = await prisma.user.findFirst({ where: { user_email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', errorTypes.CONFLICT);
    }

    const hashedPassword = await hashPassword(user_password);

    const user = await prisma.user.create({
      data: {
        user_email,
        user_password: hashedPassword,
        user_name,
        user_role,
      },
    });

    if (user_role === UserRole.ADMIN) {
      await prisma.adminRegistrationRequest.create({
        data: {
          userId: user.id,
          org_name: org_name!,
          org_type: org_type!,
          org_location: org_location!,
          status: 'PENDING',
        },
      });

      return {
        message: 'Admin registration request submitted. Awaiting Super Admin approval.',
      };
    }

    if (user_role === UserRole.SUPER_ADMIN) {
      await prisma.superAdmin.create({
        data: {
          super_admin_email: user_email,
          super_admin_password: hashedPassword,
          super_admin_name: user_name,
        },
      });
    }

    const tokenPayload = {
      userId: user.id,
      userRole: user.user_role,
      email: user.user_email, // ✅ Include email
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    if (redis) {
      const tokenId = uuidv4();
      await redis.set(
        `refresh_token:${user.id}:${tokenId}`,
        refreshToken,
        'EX',
        60 * 60 * 24 * 7
      );
    }

    const { user_password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findFirst({
      where: { user_email: email },
    });

    if (!user || !(await comparePasswords(password, user.user_password))) {
      throw new AppError('Invalid credentials', errorTypes.UNAUTHORIZED);
    }

    const tokenPayload = {
      userId: user.id,
      userRole: user.user_role,
      email: user.user_email, // ✅ Include email
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    if (redis) {
      const tokenId = uuidv4();
      await redis.set(
        `refresh_token:${user.id}:${tokenId}`,
        refreshToken,
        'EX',
        60 * 60 * 24 * 7 // 7 days
      );
    }

    const { user_password: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }

  async superAdminLogin(email: string, password: string): Promise<LoginResponse> {
    const superAdmin = await prisma.user.findFirst({
      where: {
        user_email: email,
        user_role: UserRole.SUPER_ADMIN,
      },
    });

    if (!superAdmin || !(await comparePasswords(password, superAdmin.user_password))) {
      throw new AppError('Invalid superadmin credentials', errorTypes.UNAUTHORIZED);
    }

    const tokenPayload = {
      userId: superAdmin.id,
      userRole: superAdmin.user_role,
      email: superAdmin.user_email, // ✅ include email
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    if (redis) {
      const tokenId = uuidv4();
      await redis.set(
        `refresh_token:${superAdmin.id}:${tokenId}`,
        refreshToken,
        'EX',
        60 * 60 * 24 * 7
      );
    }

    const { user_password: _, ...userWithoutPassword } = superAdmin;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; user: Omit<User, 'user_password'> }> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      if (redis) {
        const isBlacklisted = await redis.exists(`blacklist:${refreshToken}`);
        if (isBlacklisted) {
          throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
        }
      }

      // 🔍 Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new AppError('User not found', errorTypes.UNAUTHORIZED);
      }

      const accessToken = generateAccessToken({
        userId: payload.userId,
        userRole: payload.userRole,
        email: user.user_email,
      });

      const { user_password: _, ...userWithoutPassword } = user;
      return { accessToken, user: userWithoutPassword };

    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
    }
  }


  async logout(userId: string, refreshToken: string): Promise<void> {
    if (redis) {
      await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 60 * 60 * 24 * 7);
      const keys = await redis.keys(`refresh_token:${userId}:*`);
      if (keys.length > 0) await redis.del(keys);
    }

    logger.info(`User logged out: ${userId}`);
  }

  async requestPasswordReset(email: string): Promise<void> {
    logger.info(`Password reset requested for: ${email}`);
    throw new AppError('Password reset not implemented', errorTypes.NOT_IMPLEMENTED);
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    logger.info('Password reset completed');
    throw new AppError('Password reset not implemented', errorTypes.NOT_IMPLEMENTED);
  }
}

export default new AuthService();
export { redis };
