import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response';
import { errorTypes } from '../utils/errors';

export const validateRequest =
  (schema: ZodSchema<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const formatted = result.error.issues.map((e) => e.message).join(', ');
        return sendError(res, formatted, errorTypes.BAD_REQUEST);
      }

      next();
    };
