// src/repository/base/prismaErrors.ts

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export function handlePrismaError(error: any): DatabaseError {
  if (error.code === 'P2002') {
    return new DatabaseError("Unique constraint failed", error.code);
  }
  if (error.code === 'P2025') {
    return new DatabaseError("Record not found", error.code);
  }
  return new DatabaseError("Database error occurred", error.code);
}
