import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('🔥 Error occurred:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    ...err
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}
