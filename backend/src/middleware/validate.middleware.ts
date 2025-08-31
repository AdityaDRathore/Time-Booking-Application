// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response';

type Location = 'body' | 'query' | 'params';

const validate =
  (schema: ZodSchema<any>, location: Location = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
      const data = req[location];

      const result = schema.safeParse(data);

      if (!result.success) {
        return sendError(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          result.error.flatten()
        );
      }

      req[location] = result.data;
      next();
    };

export default validate;
