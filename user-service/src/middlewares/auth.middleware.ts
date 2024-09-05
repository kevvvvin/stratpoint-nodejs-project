import jwt from 'jsonwebtoken';
import { envConfig } from '../configs';
import { Request, Response, NextFunction } from 'express';
import { RoleEnum } from '../enums';
import { JwtPayload, IRole, IUser } from '../types';
import { User, BlacklistedToken } from '../models';
import { JwtError, UnauthorizedError } from '../utils';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

const authenticateJWT = async (
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

    const blackListed = await BlacklistedToken.findOne({ token });
    if (blackListed) {
      const error = new JwtError('Access denied. Token has been blacklisted');
      return next(error);
    }

    const decoded = jwt.verify(token, envConfig.jwtSecret) as JwtPayload;

    // if (req.headers['x-internal-service-secret'] === envConfig.serviceSecret)
    //   return next();

    const user = await User.findById(decoded.sub)
      .select('-password')
      .populate('roles', 'name');

    if (!user) {
      const error = new JwtError('Invalid token. User not found');
      return next(error);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (allowedRoles: RoleEnum[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      // if (req.headers['x-internal-service-secret'] === envConfig.serviceSecret)
      //   return next();

      const user = req.user as IUser;
      if (!user) {
        const error = new JwtError('Access denied. User not found');
        return next(error);
      }

      const userRoles = user.roles.map((role: IRole) => role.name);

      const hasRole = allowedRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        const error = new UnauthorizedError(
          'Access denied. You are not authorized to do this action',
        );
        return next(error);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export { authenticateJWT, authorizeRoles };
