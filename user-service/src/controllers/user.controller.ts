import { Request, Response, NextFunction } from 'express';
import { IUser, UserResult } from '../types';
import { UserService } from '../services';
import { UserResponseDto } from '../dtos';
import { logger } from '../utils';

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const result: UserResult[] = await this.userService.getAllUsers();
      const message = 'Retrieved all users successfully';
      const response = new UserResponseDto(message, result);
      logger.info(message, result);
      return res.status(200).json(response);
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

      const result = await this.userService.getUserById(userId, loggedInUser);

      const message = 'Retrieved user successfully';
      const response = new UserResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async updateKycStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = req.user as IUser;
      const targetUserId = req.params.userId;

      const { updatedStatus } = req.body;

      const result = await this.userService.updateKycStatus(
        userDetails,
        targetUserId,
        updatedStatus,
      );
      const message = "User's KYC status updated successfully";
      const response = new UserResponseDto(message, result);
      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
