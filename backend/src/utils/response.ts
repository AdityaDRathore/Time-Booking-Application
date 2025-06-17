import { Response } from 'express';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

/**
 * Send a standardized success response.
 * @param res Express response object
 * @param data Response data
 * @param statusCode HTTP status (default 200)
 * @param meta Optional pagination or metadata
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse<T>['meta']
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status (default 500)
 * @param details Optional additional details (e.g., validation errors)
 * @param code Optional internal error code
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
  details?: unknown
): void => {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };

  res.status(statusCode).json(response);
};
