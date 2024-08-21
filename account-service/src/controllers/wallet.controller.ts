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
      const authHeader = req.header('Authorization') as string;
      const userDetails = req.payload as JwtPayload;

      logger.info(authHeader);

      const result: WalletResult = await this.walletService.create(
        userDetails,
        authHeader,
      );
      const message = 'Wallet created successfully';
      const response = new WalletResponseDto(message, result);

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getWalletBalance(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = req.payload as JwtPayload;

      const result: WalletResult = await this.walletService.getWalletBalance(
        userDetails.sub,
      );
      const message = 'Retrieved wallet successfully';
      const response = new WalletResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
