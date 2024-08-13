import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/utils.types';
import { IRole, IUser } from '../types/schema.types';
import User from '../models/user.model';
import config from '../config';
import { RoleEnum } from '../enums/role.enum';
import { JwtError } from '../types/error.types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
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
    if (!authHeader) {
      const error: JwtError = new Error('Access denied. No token provided.');
      error.name = 'UnauthorizedError';
      return next(error);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const error: JwtError = new Error('Access denied. Invalid token format.');
      error.name = 'UnauthorizedError';
      return next(error);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('roles', 'name');

    if (!user) {
      const error: JwtError = new Error('Invalid token. User not found.');
      error.name = 'UnauthorizedError';
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
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
