import { UserRole, User, PrismaClient } from '@prisma/client';
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
  user: Omit<User, 'user_password'>;
}

interface RegisterData {
  user_email: string;
  user_password: string;
  user_name: string;
}

export class AuthService {
  async register(userData: RegisterData): Promise<Omit<User, 'user_password'>> {
    const { user_email, user_password, user_name } = userData;

    logger.info(`📥 Registering new user: ${user_email}`);
    try {
      const existingUser = await prisma.user.findFirst({ where: { user_email } });

      if (existingUser) {
        logger.warn(`⚠️ User already exists: ${user_email}`);
        throw new AppError('User with this email already exists', errorTypes.CONFLICT);
      }

      const hashedPassword = await hashPassword(user_password).catch(err => {
        logger.error('❌ Password hashing failed:', err);
        throw new AppError(err.message, errorTypes.BAD_REQUEST);
      });

      logger.info(`🔐 Hashed password for ${user_email}: ${hashedPassword}`);

      const newUser = await prisma.user.create({
        data: {
          user_email,
          user_password: hashedPassword,
          user_name,
          user_role: UserRole.USER,
        },
      });

      logger.info(`✅ New user created: ${JSON.stringify(newUser, null, 2)}`);

      const { user_password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (err: any) {
      console.error('🔥 Prisma error during user registration:', err);
      logger.error('❌ Error during registration:', err);

      if (err.code === 'P2002') {
        throw new AppError('Email must be unique', errorTypes.CONFLICT);
      }

      throw new AppError(
        'Something went wrong during registration',
        errorTypes.INTERNAL_SERVER
      );
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findFirst({
      where: { user_email: email },
      select: {
        id: true,
        user_email: true,
        user_name: true,
        user_role: true,
        user_password: true,
        validation_key: true,
        resetToken: true,
        resetTokenExpiry: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !(await comparePasswords(password, user.user_password))) {
      throw new AppError('Invalid credentials', errorTypes.UNAUTHORIZED);
    }

    const tokenPayload = { userId: user.id, userRole: user.user_role };
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

  async superAdminLogin(email: string, password: string): Promise<LoginResponse> {
    const superAdmin = await prisma.user.findFirst({
      where: { user_email: email, user_role: UserRole.SUPER_ADMIN },
      select: {
        id: true,
        user_email: true,
        user_name: true,
        user_role: true,
        user_password: true,
        validation_key: true,
        resetToken: true,
        resetTokenExpiry: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!superAdmin || !(await comparePasswords(password, superAdmin.user_password))) {
      throw new AppError('Invalid superadmin credentials', errorTypes.UNAUTHORIZED);
    }

    const tokenPayload = { userId: superAdmin.id, userRole: superAdmin.user_role };
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

    logger.info(`SuperAdmin logged in: ${email}`);
    return { accessToken, user: userWithoutPassword };
  }


  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      if (redis) {
        const isBlacklisted = await redis.exists(`blacklist:${refreshToken}`);
        if (isBlacklisted) {
          throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
        }
      }

      return generateAccessToken({
        userId: payload.userId,
        userRole: payload.userRole,
      });
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
    throw new AppError(
      'Password reset not implemented in current schema',
      errorTypes.INTERNAL_SERVER
    );
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    logger.info('Password reset completed');
    throw new AppError(
      'Password reset not implemented in current schema',
      errorTypes.NOT_IMPLEMENTED
    );
  }
}

export default new AuthService();

// 👉 Export Redis to allow test cleanup
export { redis };
