import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import logger from '../utils/logger';
import { IUser } from '../types/schema.types';
import { UserResponseBody } from '../types/user.types';

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const result: UserResponseBody[] = await this.userService.getAllUsers();

      const message = 'Retrieved all users successfully';
      logger.info(message, result);
      return res.status(200).json({ message: message, result });
    } catch (err) {
      next(err);
    }
  }

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userId: string = req.params.id;
      const loggedInUser = req.user as IUser;

      const result: UserResponseBody = await this.userService.getUserById(
        userId,
        loggedInUser,
      );

      const message = 'Retrieved user successfully';
      logger.info(message, result);
      return res.status(200).json({ message: message, result });
    } catch (err) {
      next(err);
    }
  }
}
