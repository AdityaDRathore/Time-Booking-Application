import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response';

const validate =
  (schema: ZodSchema<any>, property: 'body' | 'params' | 'query' = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
      // Validate the selected property (body, params, or query)
      const result = schema.safeParse(req[property]);

      if (!result.success) {
        return sendError(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          result.error.flatten()
        );
      }

      // Replace the validated data (for example, sanitized/parsed) back to req
      req[property] = result.data;
      next();
    };

export default validate;
