// src/exceptions/DatabaseError.ts

export class DatabaseError extends Error {
  public readonly name: string;
  public readonly originalError: unknown;
  public readonly statusCode: number;

  constructor(message: string, originalError?: unknown, statusCode: number = 500) {
    super(message);

    // Maintain proper stack trace (only works in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }

    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.statusCode = statusCode;
  }
}
