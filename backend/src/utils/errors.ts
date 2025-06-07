//--------------------------------Error handling framework--------------------------------
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string; // Added errorCode

  constructor(message: string, statusCode: number, errorCode?: string) {
    // Added errorCode
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode; // Store errorCode

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorTypes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER: 500,
  NOT_IMPLEMENTED: 501,
};
