import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'shared-common';
import { WalletService } from '../services';
import {
  AddPaymentMethodRequestDto,
  DepositFundsRequestDto,
  DepositFundsResponseDto,
  PaymentMethodResponseDto,
  TransferFundsRequestDto,
  TransferResponseDto,
  WalletResponseDto,
  WithdrawFundsRequestDto,
  WithdrawFundsResponseDto,
} from '../dtos';
import { logger } from '../utils';
import { PaymentIntentResponseDto } from 'shared-account-payment';
import {
  TransactionStatusResponseDto,
  TransactionResponseDto,
} from 'shared-account-transaction';

export class WalletController {
  constructor(private walletService: WalletService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const userDetails = res.locals.payload as JwtPayload;

      const result = await this.walletService.create(userDetails, authHeader);
      const response = new WalletResponseDto('Wallet created successfully', result);

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getWalletBalance(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = res.locals.payload as JwtPayload;

      const result = await this.walletService.getWalletBalance(userDetails.sub);
      const response = new WalletResponseDto('Retrieved wallet successfully', result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async addPaymentMethod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const paymentMethod: AddPaymentMethodRequestDto = req.body;
      const userDetails = res.locals.payload as JwtPayload;

      const result = await this.walletService.addPaymentMethod(
        userDetails.sub,
        paymentMethod.paymentMethodId,
        authHeader,
      );

      const response = new PaymentMethodResponseDto(
        'Payment method added successfully',
        result,
      );

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentMethods(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = res.locals.payload as JwtPayload;

      const paymentMethods = await this.walletService.getPaymentMethods(userDetails.sub);

      const response = new PaymentMethodResponseDto(
        'Retrieved payment methods successfully',
        paymentMethods,
      );

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async deletePaymentMethod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { paymentMethodId } = req.params;
      const authHeader = req.header('Authorization') as string;
      const userDetails = res.locals.payload as JwtPayload;

      const deletedMethod = await this.walletService.deletePaymentMethod(
        userDetails.sub,
        paymentMethodId,
        authHeader,
      );
      const message = paymentMethodId.startsWith('pm_card')
        ? 'Test payment method deleted successfully'
        : 'Payment method deleted successfully';
      const response = new PaymentMethodResponseDto(message, deletedMethod);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async createPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const { amount } = req.body;
      const userDetails = res.locals.payload as JwtPayload;

      const paymentIntent = await this.walletService.createPaymentIntent(
        authHeader,
        amount,
        userDetails.sub,
      );

      const response = new PaymentIntentResponseDto(
        'Payment intent created successfully',
        paymentIntent,
      );

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async confirmPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const userDetails = res.locals.payload as JwtPayload;
      const { paymentIntentId, paymentMethodId } = req.body;

      const result = await this.walletService.confirmPaymentIntent(
        authHeader,
        userDetails.sub,
        paymentIntentId,
        paymentMethodId,
      );

      const response = new DepositFundsResponseDto(
        'Payment intent confirmed successfully',
        result,
      );

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { paymentIntentId } = req.params;
      const authHeader = req.header('Authorization') as string;

      const result = await this.walletService.getPaymentStatus(
        authHeader,
        paymentIntentId,
      );

      const response = new TransactionStatusResponseDto(
        'Payment status retrieved successfully',
        result,
      );

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async deposit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const userDetails = res.locals.payload as JwtPayload;
      const depositRequest: DepositFundsRequestDto = req.body;

      const result = await this.walletService.deposit(
        authHeader,
        userDetails.sub,
        depositRequest.amount,
        depositRequest.paymentMethodId,
      );

      const response = new DepositFundsResponseDto('Deposit successful', result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async withdraw(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const userDetails = res.locals.payload as JwtPayload;
      const withdrawRequest: WithdrawFundsRequestDto = req.body;

      const result = await this.walletService.withdraw(
        authHeader,
        userDetails.sub,
        withdrawRequest.amount,
      );

      const response = new WithdrawFundsResponseDto('Withdrawal successful', result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async transfer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const transferRequest: TransferFundsRequestDto = req.body;
      const userDetails = res.locals.payload as JwtPayload;

      const result = await this.walletService.transfer(
        authHeader,
        userDetails.sub,
        transferRequest.toUserId,
        transferRequest.amount,
      );

      const response = new TransferResponseDto('Transfer successful', result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const authHeader = req.header('Authorization') as string;
      const userDetails = res.locals.payload as JwtPayload;

      const transactions = await this.walletService.getTransactions(
        authHeader,
        userDetails.sub,
      );

      const message = 'Retrieved transactions successfully';
      const response = new TransactionResponseDto(message, transactions);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
