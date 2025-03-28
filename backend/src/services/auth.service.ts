//----------------------Core authentication logic----------------------------

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

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { user_email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', errorTypes.CONFLICT);
    }

    // Hash password
    const hashedPassword = await hashPassword(user_password);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        user_email,
        user_password: hashedPassword,
        user_name,
        user_role: 'USER', // Default role
      },
    });

    // Remove password from returned data
    const { user_password: _, ...userWithoutPassword } = newUser;

    logger.info(`User registered: ${user_email}`);
    return userWithoutPassword;
  }

  // User login
  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await prisma.user.findFirst({
      where: { user_email: email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', errorTypes.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.user_password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', errorTypes.UNAUTHORIZED);
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, role: user.user_role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in Redis if available
    if (redis) {
      const tokenId = uuidv4();
      await redis.set(
        `refresh_token:${user.id}:${tokenId}`,
        refreshToken,
        'EX',
        60 * 60 * 24 * 7 // 7 days
      );
    }

    // Remove password from returned data
    const { user_password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${email}`);
    return { accessToken, user: userWithoutPassword };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Check if token is blacklisted (if Redis is available)
      if (redis) {
        const isBlacklisted = await redis.exists(`blacklist:${refreshToken}`);
        if (isBlacklisted) {
          throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
        }
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: payload.userId,
        role: payload.role,
      });

      return newAccessToken;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
    }
  }

  // Logout user
  async logout(userId: string, refreshToken: string): Promise<void> {
    if (redis) {
      // Add refresh token to blacklist until its expiration
      await redis.set(
        `blacklist:${refreshToken}`,
        '1',
        'EX',
        60 * 60 * 24 * 7 // 7 days
      );

      // Remove all refresh tokens for this user (optional, for complete logout)
      const keys = await redis.keys(`refresh_token:${userId}:*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }

    logger.info(`User logged out: ${userId}`);
  }

  // Request password reset - Note: You'll need to add resetToken fields to your schema
  async requestPasswordReset(email: string): Promise<void> {
    // Note: This method requires schema modifications
    logger.info(`Password reset requested for: ${email}`);
    throw new AppError('Password reset not implemented in current schema', errorTypes.INTERNAL_SERVER);
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Note: This method requires schema modifications
    logger.info('Password reset completed');
    throw new AppError('Password reset not implemented in current schema', errorTypes.INTERNAL_SERVER);
  }
}

export default new AuthService();