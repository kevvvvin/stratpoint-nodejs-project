import { Request, Response, NextFunction } from 'express';
import { JwtPayload, WalletResult } from '../types';
import { WalletService } from '../services';
import { WalletResponseDto } from '../dtos';
import { logger } from '../utils';

export class WalletController {
  constructor(private walletService: WalletService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = req.payload as JwtPayload;

      const result: WalletResult = await this.walletService.create(userDetails.sub);
      const message = 'Wallet created successfully';
      const response = new WalletResponseDto(message, result);

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getWalletByUserId(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      // TODO: get userId from JWT token
      const userId = '123-456-789';

      const result: WalletResult = await this.walletService.getWalletByUserId(userId);
      const message = 'Retrieved wallet successfully';
      const response = new WalletResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
