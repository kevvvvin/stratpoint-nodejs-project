import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { KycService } from '../services/kyc.service';
import { IUser } from '../types/schema.types';
import { KycResponseBody } from '../types/kyc.types';
import { validateKyc } from '../utils/validator';

export class KycController {
  constructor(private kycService: KycService) {}

  async initiate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const loggedInUser = req.user as IUser;
      const kyc: KycResponseBody = await this.kycService.initiate(
        loggedInUser._id.toString(),
      );

      const message = 'Initiated KYC successfully';
      logger.info(message, kyc);
      return res.status(200).json({ message: message, kyc });
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
      const { error } = validateKyc(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const loggedInUser: IUser = req.user as IUser;
      const kyc: KycResponseBody = await this.kycService.update(
        loggedInUser._id.toString(),
        req.body,
      );

      const message = 'Submitted KYC successfully';
      logger.info(message, kyc);
      return res.status(200).json({ message: message, kyc });
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
      const kyc: KycResponseBody = await this.kycService.approve(userId);

      const message = 'Approved KYC successfully';
      logger.info(message, kyc);
      return res.status(200).json({ message: message, kyc });
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
      const kyc: KycResponseBody = await this.kycService.reject(userId);

      const message = 'Rejected KYC successfully';
      logger.info(message, kyc);
      return res.status(200).json({ message: message, kyc });
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
      const result: KycResponseBody[] = await this.kycService.getAllKyc();

      const message = 'Retrieved all KYCs successfully';
      logger.info(message, result);
      return res.status(200).json({ message: message, result });
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

      const result: KycResponseBody = await this.kycService.getKycByUserId(
        userId,
        loggedInUser,
      );

      const message = 'Retrieved KYC successfully';
      logger.info(message, result);
      return res.status(200).json({ message: message, result });
    } catch (err) {
      next(err);
    }
  }
}
