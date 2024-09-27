import { Request, Response, NextFunction } from 'express';
import { IUser, UserResult } from '../types';
import { UserService } from '../services';
import { UserResponseDto } from '../dtos';
import { logger } from '../utils';
import { KycStatusUpdateRequestDto } from 'shared-user-kyc';

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
      const loggedInUser = res.locals.user as IUser;

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
      const userDetails = res.locals.user as IUser;
      const targetUserId = req.params.userId;

      const kycDetails: KycStatusUpdateRequestDto = req.body;

      const result = await this.userService.updateKycStatus(
        userDetails,
        targetUserId,
        kycDetails.updatedStatus,
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
