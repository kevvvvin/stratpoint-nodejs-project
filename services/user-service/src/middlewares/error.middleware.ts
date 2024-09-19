import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils';
import { sharedErrorHandler } from 'shared-common';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response | void => {
  logger.error(err);
  return sharedErrorHandler(err, _req, res, _next);
};
