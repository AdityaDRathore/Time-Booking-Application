import { Request } from 'express';
import { UserRole } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      id: string;
      role: UserRole;
    };
  }
}
