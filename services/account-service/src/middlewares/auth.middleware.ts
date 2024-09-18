import jwt from 'jsonwebtoken';
import { envConfig } from '../configs';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload, JwtError, AuthError, fetchHelper } from 'shared-common';

declare global {
  namespace Express {
    interface Request {
      payload?: JwtPayload;
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
      const error = new JwtError('Access denied. No token provided');
      return next(error);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const error = new JwtError('Access denied. Invalid token format');
      return next(error);
    }

    const validateResponse = await fetchHelper(
      `Bearer ${token}`,
      `http://${envConfig.userService}:3001/api/auth/validate-token`,
      'GET',
    );

    if (!validateResponse.ok) {
      const error = new JwtError('Token is not valid.');
      return next(error);
    }

    const decoded = jwt.decode(token) as JwtPayload;
    if (decoded.kycStatus !== 'VERIFIED') {
      const error = new AuthError(
        'User is not verified. Please verify your account.',
        'AuthenticationError',
      );
      return next(error);
    }

    req.payload = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
