import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtError, AuthError, fetchHelper } from '../utils';
import { JwtPayload } from '../types';

export const authenticateJWT = (requestingService: string, userService?: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new JwtError('Access denied. No token provided');
        return next(error);
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        const error = new JwtError('Access denied. Invalid token format');
        return next(error);
      }

      const hostName = userService ? userService : 'localhost';
      const validateResponse = await fetchHelper(
        `Bearer ${token}`,
        `http://${hostName}:3001/api/auth/validate-token`,
        'GET',
      );

      if (!validateResponse.ok) {
        const error = new JwtError('Token is not valid.');
        return next(error);
      }

      const decoded = jwt.decode(token) as JwtPayload;
      if (
        requestingService !== 'kyc-service' &&
        requestingService !== 'notification-service' &&
        decoded.kycStatus !== 'VERIFIED'
      ) {
        const error = new AuthError(
          'User is not verified. Please verify your account.',
          'AuthenticationError',
        );
        return next(error);
      }

      res.locals.payload = decoded;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
