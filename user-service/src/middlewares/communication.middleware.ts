import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../configs';

export const verifyInternalService = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const isInternalRequest =
      req.headers['x-internal-service-secret'] === envConfig.serviceSecret;
    if (!isInternalRequest)
      throw new Error('Forbidden. Not authorized to generate service token');
    next();
  } catch (error) {
    next(error);
  }
};
