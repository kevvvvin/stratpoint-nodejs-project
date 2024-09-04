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
      const adminToken = req.adminToken as string;
      const user = req.payload as JwtPayload;
      const loginTime = new Date().toISOString();
      const loginLocation = req.ip as string;

      await this.notifService.notifyLogin(adminToken, user.sub, loginTime, loginLocation);
      const message = 'Login notification sent successfully';

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
      const adminToken = req.adminToken as string;
      const user = req.payload as JwtPayload;
      const { initialBalance } = req.body;

      await this.notifService.notifyWalletCreation(adminToken, user.sub, initialBalance);
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
      const adminToken = req.adminToken as string;
      const user = req.payload as JwtPayload;
      const { last4, cardBrand } = req.body;

      await this.notifService.notifyPaymentMethodAdded(
        adminToken,
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
      const adminToken = req.adminToken as string;
      const user = req.payload as JwtPayload;
      const { amount, transactionId } = req.body;

      await this.notifService.notifyDeposit(adminToken, user.sub, amount, transactionId);
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
      const adminToken = req.adminToken as string;
      const user = req.payload as JwtPayload;
      const { amount, newBalance, transactionId, withdrawalStatus, withdrawalMethod } =
        req.body;

      await this.notifService.notifyWithdraw(
        adminToken,
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
      const adminToken = req.adminToken as string;
      const user = req.payload as JwtPayload;
      const { toUserId, amount, transactionId, fromBalance, toBalance } = req.body;

      await this.notifService.notifyTransfer(
        adminToken,
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
