import { Response } from 'express';

type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
};

/**
 * Send a standardized success response.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiMeta
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };

  res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
  details?: unknown
): void => {
  const error: ApiError = { message };

  if (code) error.code = code;
  if (typeof details === 'object' && details !== null) {
    error.details = details;
  }

  const response: ApiResponse<null> & { message: string } = {
    success: false,
    error,
    message, // 👈 Add this for compatibility with tests
  };

  res.status(statusCode).json(response);
};
