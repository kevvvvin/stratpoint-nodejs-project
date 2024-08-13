import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { CustomError } from '../types/error.types';
import { isMongooseError, isJwtError, isNotFoundError } from '../utils/typeGuards';

const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response | void => {
  logger.error(err);

  if (isNotFoundError(err) && err.name === 'NotFoundError') {
    return res.status(404).json({ error: 'Not Found', message: err.message });
  }

  // Mongoose validation error
  if (isMongooseError(err) && err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json({ error: errors });
  }

  // Mongoose duplicate key error
  if (isMongooseError(err) && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res
      .status(400)
      .json({ error: `${field} already exists.`, message: err.message });
  }

  // JWT authentication error
  if (isJwtError(err) && err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token', message: err.message });
  }

  // Default to 500 server error
  return res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
};

export default errorHandler;
