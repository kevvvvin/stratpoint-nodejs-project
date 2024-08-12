import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { KycService } from '../services/kyc.service';

export class KycController {
  constructor(private kycService: KycService) {}

  async initiate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userId: string = req.params.id;
      const kyc = await this.kycService.initiate(userId);
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
      const userId: string = req.params.id;
      const kyc = await this.kycService.update(userId, req.body);
      logger.info('Submitted KYC successfully', kyc);
      return res.status(200).json(kyc);
    } catch (err) {
      next(err);
    }
  }
}
