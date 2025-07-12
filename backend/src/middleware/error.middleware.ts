import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { HttpException } from '../exceptions/HttpException';

export const globalErrorHandler = (
  err: Error | HttpException,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err instanceof HttpException ? err.status : 500;
  const message = err.message || 'Internal server error';

  logger.error(`[${req.method}] ${req.originalUrl} - ${message}`);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
