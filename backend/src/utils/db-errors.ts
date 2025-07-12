import { Prisma } from '@prisma/client';
import { AppError, errorTypes } from './errors';
import logger from './logger';

// Prisma error types
export enum PrismaErrorType {
  // Connection errors
  CONNECTION_ERROR = 'P1000',
  CONNECTION_TIMEOUT = 'P1001',

  // Query errors
  RECORD_NOT_FOUND = 'P2001',
  UNIQUE_CONSTRAINT = 'P2002',
  FOREIGN_KEY_CONSTRAINT = 'P2003',
  CONSTRAINT_FAILED = 'P2004',

  // Migration errors
  MIGRATION_ERROR = 'P3000',

  // Validation errors
  VALUE_TOO_LONG = 'P4000',
}

export class DatabaseError extends AppError {
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message, statusCode);
    this.code = code;
  }
}

// Maps Prisma errors to user-friendly error messages
export function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn(`Database error: ${error.message}`, { code: error.code, meta: error.meta });

    switch (error.code) {
      case PrismaErrorType.UNIQUE_CONSTRAINT: {
        // Extract field name for better error messages
        const field = (error.meta?.target as string[]) || ['record'];
        return new DatabaseError(
          `A ${field[0]} with this value already exists.`,
          errorTypes.CONFLICT,
          error.code,
        );
      }

      case PrismaErrorType.FOREIGN_KEY_CONSTRAINT:
        return new DatabaseError(
          'Related record not found or cannot be modified.',
          errorTypes.BAD_REQUEST,
          error.code,
        );

      case PrismaErrorType.RECORD_NOT_FOUND:
        return new DatabaseError(
          'The requested record was not found.',
          errorTypes.NOT_FOUND,
          error.code,
        );

      default:
        return new DatabaseError(
          'A database error occurred.',
          errorTypes.INTERNAL_SERVER,
          error.code,
        );
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    logger.warn(`Validation error: ${error.message}`);
    return new AppError('Invalid data provided to database operation.', errorTypes.BAD_REQUEST);
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    logger.error(`Critical database error: ${error.message}`);
    return new AppError('A critical database error occurred.', errorTypes.INTERNAL_SERVER);
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error(`Database initialization error: ${error.message}`);
    return new AppError('Could not connect to the database.', errorTypes.INTERNAL_SERVER);
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    logger.error(`Unknown database error: ${error.message}`);
    return new AppError('An unexpected database error occurred.', errorTypes.INTERNAL_SERVER);
  }

  // For any other error types
  logger.error('Unhandled database error', { error });
  return new AppError('An unexpected error occurred.', errorTypes.INTERNAL_SERVER);
}

export const withErrorHandling = async <T>(
  databaseOperation: () => Promise<T>,
  notFoundMessage = 'Resource not found',
): Promise<T> => {
  try {
    const result = await databaseOperation();

    // Check for null result when expecting data
    if (result === null || result === undefined) {
      throw new AppError(notFoundMessage, errorTypes.NOT_FOUND);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw handlePrismaError(error);
  }
};
