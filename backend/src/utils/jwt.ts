import jwt, { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError, errorTypes } from './errors';

export type TokenPayload = {
  userId: string;
  userRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN'; // You can import UserRole if needed
};

// ---------------------- Generate Tokens ---------------------- //

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || '15m', // fallback
  } as SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN || '7d',
  } as SignOptions);
};

// ---------------------- Verify Tokens ---------------------- //

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError('Access token expired', errorTypes.UNAUTHORIZED);
    }
    throw new AppError('Invalid access token', errorTypes.UNAUTHORIZED);
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError('Refresh token expired', errorTypes.UNAUTHORIZED);
    }
    throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
  }
};

// ---------------------- Helper ---------------------- //

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', errorTypes.UNAUTHORIZED);
  }

  return authHeader.split(' ')[1];
};
