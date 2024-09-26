import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services';
import { logger } from '../utils';
import { JwtPayload } from 'shared-common';
import {
  AddPaymentMethodNotificationRequestDto,
  CreateWalletNotificationRequestDto,
  DepositNotificationRequestDto,
  TransferNotificationRequestDto,
  WithdrawNotificationRequestDto,
} from 'shared-notification';

export class NotificationController {
  constructor(private notifService: NotificationService) {}

  async notifyLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const user = res.locals.payload as JwtPayload;
      const loginTime = new Date().toISOString();
      const loginLocation = req.ip as string;

      await this.notifService.notifyLogin(
        serviceToken,
        user.sub,
        loginTime,
        loginLocation,
      );
      const message = 'Login notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async notifyEmailVerification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const { userId, emailVerificationToken } = req.body;

      await this.notifService.notifyEmailVerification(
        serviceToken,
        userId,
        emailVerificationToken,
      );
      const message = 'Email verification notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async notifyKycUpdate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const { userId, kycStatus, rejectionReason } = req.body;

      await this.notifService.notifyKycUpdate(
        serviceToken,
        userId,
        kycStatus,
        rejectionReason,
      );
      const message = 'KYC update notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async notifyWalletCreation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const user = res.locals.payload as JwtPayload;
      const walletDetails: CreateWalletNotificationRequestDto = req.body;

      await this.notifService.notifyWalletCreation(
        serviceToken,
        user.sub,
        walletDetails.initialBalance,
      );
      const message = 'Wallet creation notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async notifyPaymentMethodAdded(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const user = res.locals.payload as JwtPayload;
      const cardDetails: AddPaymentMethodNotificationRequestDto = req.body;

      await this.notifService.notifyPaymentMethodAdded(
        serviceToken,
        user.sub,
        cardDetails.last4,
        cardDetails.brand,
      );
      const message = 'Payment method added notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async notifyDeposit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const user = res.locals.payload as JwtPayload;
      const depositDetails: DepositNotificationRequestDto = req.body;

      await this.notifService.notifyDeposit(
        serviceToken,
        user.sub,
        depositDetails.amount,
        depositDetails.transactionId,
      );
      const message = 'Deposit notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async notifyWithdraw(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const user = res.locals.payload as JwtPayload;
      const withdrawDetails: WithdrawNotificationRequestDto = req.body;

      await this.notifService.notifyWithdraw(
        serviceToken,
        user.sub,
        withdrawDetails.amount,
        withdrawDetails.newBalance,
        withdrawDetails.transactionId,
        withdrawDetails.withdrawalStatus,
        withdrawDetails.withdrawalMethod,
      );
      const message = 'Withdraw notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async notifyTransfer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const user = res.locals.payload as JwtPayload;
      const transferDetails: TransferNotificationRequestDto = req.body;

      await this.notifService.notifyTransfer(
        serviceToken,
        user.sub,
        transferDetails.toUserId,
        transferDetails.amount,
        transferDetails.transactionId,
        transferDetails.fromBalance,
        transferDetails.toBalance,
      );
      const message = 'Transfer notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }
}
