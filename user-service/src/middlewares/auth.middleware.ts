import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { JwtPayload } from '../types/utils.types';
import { IRole, IUser } from '../types/schema.types';
import User from '../models/user.model';
import logger from '../utils/logger';
import config from '../config';
import { RoleEnum } from '../enums/role.enum';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('roles', 'name');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const authorizeRoles = (allowedRoles: RoleEnum[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const user = req.user as IUser;
      if (!user) return res.status(403).json({ error: 'Access denied. No user found. ' });

      const userRoles = user.roles.map((role: IRole) => role.name);

      const hasRole = allowedRoles.some((role) => userRoles.includes(role));
      if (!hasRole)
        return res
          .status(403)
          .json({ error: 'Access denied. You are not authorized to do this action. ' });

      next();
    } catch (err) {
      next(err);
    }
  };
};

export { authenticateJWT, authorizeRoles };
