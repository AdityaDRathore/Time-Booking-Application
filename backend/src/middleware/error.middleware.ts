// Example of what your src/middleware/error.middleware.ts might contain:
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response'; // Assuming sendError is in utils/response.ts
import { logger } from '../utils/logger'; // Assuming logger is in utils/logger.ts

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction, // Express needs this signature for error handlers
): void => {
  if (err instanceof AppError) {
    logger.warn(
      `AppError: ${err.statusCode} - ${err.message} - errorCode: ${err.errorCode ?? 'N/A'}`,
    );
    sendError(res, err.message, err.statusCode, err.errorCode);
  } else {
    // Log unexpected errors
    logger.error('Unexpected error:', err);
    sendError(res, 'An unexpected internal server error occurred.', 500, 'INTERNAL_SERVER_ERROR');
  }
};
