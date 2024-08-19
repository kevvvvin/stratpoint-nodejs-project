import { Request, Response, NextFunction } from 'express';
import { IUser, KycResult } from '../types';
import { KycService } from '../services';
import { KycResponseDto } from '../dtos';
import { validateKyc, handleValidationError, logger } from '../utils';

export class KycController {
  constructor(private kycService: KycService) {}

  async initiate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const loggedInUser = req.user as IUser;

      const kyc: KycResult = await this.kycService.initiate(loggedInUser);
      const message = 'Initiated KYC successfully';
      const response = new KycResponseDto(message, kyc);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async submit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    const requestValidation = validateKyc(req.body);
    if (!requestValidation.success) {
      return handleValidationError(requestValidation.errors, next);
    }

    try {
      const loggedInUser: IUser = req.user as IUser;

      const kyc: KycResult = await this.kycService.update(loggedInUser, req.body);
      const message = 'Submitted KYC successfully';
      const response = new KycResponseDto(message, kyc);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async approve(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userId: string = req.params.id;

      const kyc: KycResult = await this.kycService.approve(userId);
      const message = 'Approved KYC successfully';
      const response = new KycResponseDto(message, kyc);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async reject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userId: string = req.params.id;

      const kyc: KycResult = await this.kycService.reject(userId);
      const message = 'Rejected KYC successfully';
      const response = new KycResponseDto(message, kyc);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getAllKyc(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const result: KycResult[] = await this.kycService.getAllKyc();
      const message = 'Retrieved all KYCs successfully';
      const response = new KycResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getKycByUserId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userId: string = req.params.id;
      const loggedInUser = req.user as IUser;

      const result: KycResult = await this.kycService.getKycByUserId(
        userId,
        loggedInUser,
      );
      const message = 'Retrieved KYC successfully';
      const response = new KycResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
