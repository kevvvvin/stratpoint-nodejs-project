import { Request, Response, NextFunction } from 'express';
// import { JwtPayload } from '../types';
import { TransactionService } from '../services';
import { TransactionRequestDto, TransactionResponseDto } from '../dtos';
import { logger } from '../utils';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const transactionRequest: TransactionRequestDto = req.body;

      const result = await this.transactionService.createTransaction(transactionRequest);

      const message = 'Transaction created successfully';
      const response = new TransactionResponseDto(message, result);

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}
