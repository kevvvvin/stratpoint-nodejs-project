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
      const userId: string = req.params.id;
      const loggedInUser = req.user as IUser;

      const kyc: KycResponseBody = await this.kycService.initiate(userId, loggedInUser);

      logger.info('Initiated KYC successfully', kyc);
      return res.status(200).json(kyc);
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

      const userId: string = req.params.id;
      const loggedInUser: IUser = req.user as IUser;

      const kyc: KycResponseBody = await this.kycService.update(
        userId,
        loggedInUser,
        req.body,
      );

      logger.info('Submitted KYC successfully', kyc);
      return res.status(200).json(kyc);
    } catch (err) {
      next(err);
    }
  }
}
