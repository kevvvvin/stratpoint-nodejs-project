import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services';
import { logger } from '../utils';
import { JwtPayload } from '../types';

export class NotificationController {
  constructor(private notifService: NotificationService) {}

  async notifyLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = req.serviceToken as string;
      const user = req.payload as JwtPayload;
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
      const serviceToken = req.serviceToken as string;
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

  async notifyWalletCreation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = req.serviceToken as string;
      const user = req.payload as JwtPayload;
      const { initialBalance } = req.body;

      await this.notifService.notifyWalletCreation(
        serviceToken,
        user.sub,
        initialBalance,
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
      const serviceToken = req.serviceToken as string;
      const user = req.payload as JwtPayload;
      const { last4, cardBrand } = req.body;

      await this.notifService.notifyPaymentMethodAdded(
        serviceToken,
        user.sub,
        last4,
        cardBrand,
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
      const serviceToken = req.serviceToken as string;
      const user = req.payload as JwtPayload;
      const { amount, transactionId } = req.body;

      await this.notifService.notifyDeposit(
        serviceToken,
        user.sub,
        amount,
        transactionId,
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
      const serviceToken = req.serviceToken as string;
      const user = req.payload as JwtPayload;
      const { amount, newBalance, transactionId, withdrawalStatus, withdrawalMethod } =
        req.body;

      await this.notifService.notifyWithdraw(
        serviceToken,
        user.sub,
        amount,
        newBalance,
        transactionId,
        withdrawalStatus,
        withdrawalMethod,
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
      const serviceToken = req.serviceToken as string;
      const user = req.payload as JwtPayload;
      const { toUserId, amount, transactionId, fromBalance, toBalance } = req.body;

      await this.notifService.notifyTransfer(
        serviceToken,
        user.sub,
        toUserId,
        amount,
        transactionId,
        fromBalance,
        toBalance,
      );
      const message = 'Transfer notification sent successfully';

      logger.info({ message });
      return res.status(200).json({ message });
    } catch (err) {
      next(err);
    }
  }
}
