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
}
