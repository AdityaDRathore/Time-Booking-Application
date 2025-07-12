//-------------------------Password hashing utilities-------------------------

import bcrypt from 'bcrypt';
import { z } from 'zod';
import { AppError, errorTypes } from './errors';

// Cost factor: 12 as specified in security policy
const SALT_ROUNDS = 12;

// Password strength schema
const passwordSchema = z
  .string()
  .min(8)
  .refine(
    password => {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    },
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  );

export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, errorTypes.BAD_REQUEST);
    }
    return false;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  validatePassword(password);
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};
