import { Request, Response, NextFunction } from 'express';
import { IKyc, KycResult } from '../types';
import { JwtPayload } from 'shared-common';
import { KycService } from '../services';
import { KycResponseDto } from '../dtos';
import { logger } from '../utils';

export class KycController {
  constructor(private kycService: KycService) {}

  async initiate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const userDetails = req.payload as JwtPayload;

      const kyc: KycResult = await this.kycService.initiate(authHeader, userDetails);
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
    try {
      const authHeader = req.header('Authorization') as string;
      const userDetails = req.payload as JwtPayload;
      const kycSubmission = req.body;

      const kyc: KycResult = await this.kycService.update(
        authHeader,
        userDetails,
        kycSubmission,
      );
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
      const authHeader = req.header('Authorization') as string;
      const userDetails = req.payload as JwtPayload;
      const targetUserId: string = req.params.id;

      const kyc: KycResult = await this.kycService.approve(
        authHeader,
        userDetails,
        targetUserId,
      );
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
      const authHeader = req.header('Authorization') as string;
      const userDetails = req.payload as JwtPayload;
      const targetUserId: string = req.params.id;

      const kyc: KycResult = await this.kycService.reject(
        authHeader,
        userDetails,
        targetUserId,
      );
      const message = 'Rejected KYC successfully';
      const response = new KycResponseDto(message, kyc);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getAllKyc(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = req.payload as JwtPayload;

      const result: IKyc[] = await this.kycService.getAllKyc(userDetails);
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
      const userDetails = req.payload as JwtPayload;
      const targetUserId: string = req.params.id;

      const result: IKyc = await this.kycService.getKycByUserId(
        userDetails,
        targetUserId,
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
