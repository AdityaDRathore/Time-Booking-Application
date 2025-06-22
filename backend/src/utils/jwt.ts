//-----------------------------JWT token generation & validation-----------------------------//

import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError, errorTypes } from './errors';

interface TokenPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string, JWT_SECRET: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload; // ✅ Correct
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', errorTypes.UNAUTHORIZED);
    }
    throw new AppError('Invalid token', errorTypes.UNAUTHORIZED);
  }
};


export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.REFRESH_TOKEN_SECRET as jwt.Secret) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token expired', errorTypes.UNAUTHORIZED);
    }
    throw new AppError('Invalid refresh token', errorTypes.UNAUTHORIZED);
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', errorTypes.UNAUTHORIZED);
  }

  return authHeader.split(' ')[1];
};
