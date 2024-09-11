import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { RequestValidationError } from '../utils';

export function validateRequest<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));

      const validationError = new RequestValidationError(
        'Request Validation Failed',
        errors,
      );

      next(validationError);
    }

    next();
  };
}
