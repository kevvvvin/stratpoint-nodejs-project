import jwt from 'jsonwebtoken';
import { envConfig } from '../configs';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';
import { logger } from '../utils';

declare global {
  namespace Express {
    interface Request {
      payload?: JwtPayload;
      serviceToken?: string;
    }
  }
}

export const authenticateJWT = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Access denied. No token provided');
      return next(error);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const error = new Error('Access denied. Invalid token format');
      return next(error);
    }

    const validateResponse = await fetch(
      `http://${envConfig.userService}:3001/api/auth/validate-token`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!validateResponse.ok) {
      const error = new Error('Token is not valid.');
      return next(error);
    }

    logger.info('Token verified');
    const decoded = jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
    req.payload = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
