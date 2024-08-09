import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UserResponseBody } from '../types/response.types';
import logger from '../utils/logger';
import { IUser } from '../types/schema.types';

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const result: UserResponseBody[] = await this.userService.getAllUsers();

      logger.info('Retrieved all users successfully', result);
      return res.status(200).json(result);
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

      logger.info('Retrieved user successfully', result);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
