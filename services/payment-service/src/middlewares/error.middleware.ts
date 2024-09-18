import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils';
import {
  MongooseError,
  JwtError,
  NotFoundError,
  RequestValidationError,
} from 'shared-common';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response | void => {
  logger.error(err);

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: 'Not Found', message: err.message });
  }

  if (err instanceof RequestValidationError) {
    return res.status(400).json({ error: 'Bad Request', message: err.message });
  }

  if (err instanceof MongooseError) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return res
        .status(500)
        .json({ error: `${field} already exists.`, message: err.message });
    }

    if (err.errors) {
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(500).json({ error: errors });
    }
  }

  if (err instanceof JwtError) {
    return res.status(401).json({ error: 'Invalid token', message: err.message });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
};
