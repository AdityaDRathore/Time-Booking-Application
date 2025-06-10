// src/services/auth.service.ts

import { User, PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePasswords } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError, errorTypes } from '../utils/errors';
import logger from '../utils/logger';
import { config } from '../config/environment';

const prisma = new PrismaClient();
const redis = config.REDIS_URL ? new Redis(config.REDIS_URL) : null;

interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'user_password'>;
}

interface RegisterData {
  user_email: string;
  user_password: string;
  user_name: string;
}

export class AuthService {
  // User registration
  async register(userData: RegisterData): Promise<Omit<User, 'user_password'>> {
    const { user_email, user_password, user_name } = userData;

    const existingUser = await prisma.user.findFirst({ where: { user_email } });

    if (existingUser) {
      throw new AppError('User with this email already exists', errorTypes.CONFLICT);
    }

    const hashedPassword = await hashPassword(user_password);

    const newUser = await prisma.user.create({
      data: {
        user_email,
        user_password: hashedPassword,
        user_name,
        user_role: 'USER',
      },
    });

    const { user_password: _, ...userWithoutPassword } = newUser;

    logger.info(`User registered: ${user_email}`);
    return userWithoutPassword;
  }

  // User login
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findFirst({ where: { user_email: email } });

    if (!user) {
      throw new AppError('Invalid credentials', errorTypes.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePasswords(password, user.user_password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', errorTypes.UNAUTHORIZED);
    }

    const tokenPayload = { userId: user.id, role: user.user_role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    if (redis) {
      const tokenId = uuidv4();
      await redis.set(`refresh_token:${user.id}:${tokenId}`, refreshToken, 'EX', 60 * 60 * 24 * 7);
    }

    const { user_password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${email}`);
    return { accessToken, user: userWithoutPassword };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      if (redis) {
        const isBlacklisted = await redis.exists(`blacklist:${refreshToken}`);
        if (isBlacklisted) {
          throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
        }
      }

      const newAccessToken = generateAccessToken({
        userId: payload.userId,
        role: payload.role,
      });

      return newAccessToken;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
    }
  }

  // Logout user
  async logout(userId: string, refreshToken: string): Promise<void> {
    if (redis) {
      await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 60 * 60 * 24 * 7);
      const keys = await redis.keys(`refresh_token:${userId}:*`);
      if (keys.length > 0) await redis.del(keys);
    }

    logger.info(`User logged out: ${userId}`);
  }

  // SuperAdmin login
  async superAdminLogin(email: string, password: string): Promise<LoginResponse> {
    try {
      const superAdmin = await prisma.user.findFirst({
        where: {
          user_email: email,
          user_role: UserRole.SUPER_ADMIN, // use enum here
        },
      });

      if (!superAdmin) {
        throw new AppError('Invalid superadmin credentials', errorTypes.UNAUTHORIZED);
      }

      const isPasswordValid = await comparePasswords(password, superAdmin.user_password);
      if (!isPasswordValid) {
        throw new AppError('Invalid superadmin credentials', errorTypes.UNAUTHORIZED);
      }

      const tokenPayload = { userId: superAdmin.id, role: superAdmin.user_role };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      if (redis) {
        const tokenId = uuidv4();
        await redis.set(`refresh_token:${superAdmin.id}:${tokenId}`, refreshToken, 'EX', 60 * 60 * 24 * 7);
      }

      const { user_password: _, ...userWithoutPassword } = superAdmin;

      logger.info(`SuperAdmin logged in: ${email}`);
      return { accessToken, user: userWithoutPassword };

    } catch (error) {
      console.error('Error in superAdminLogin:', error);
      throw error;
    }
  }


  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    logger.info(`Password reset requested for: ${email}`);
    throw new AppError('Password reset not implemented in current schema', errorTypes.INTERNAL_SERVER);
  }

  // Reset password
  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    logger.info('Password reset completed');
    throw new AppError('Password reset not implemented in current schema', errorTypes.NOT_IMPLEMENTED);
  }
}

export default new AuthService();
