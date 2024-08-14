import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { validateLogin, validateUser } from '../utils/validator';
import logger from '../utils/logger';
import { AuthResponseBody } from '../types/user.types';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const result: AuthResponseBody = await this.authService.register(req.body);

      const message = 'User registered successfully';
      logger.info(message, result);
      return res.status(200).json({ message: message, result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const result: AuthResponseBody = await this.authService.login(req.body);

      const message = 'User logged in successfully';
      logger.info(message, result);
      return res.status(200).json({ message: message, result });
    } catch (err) {
      next(err);
    }
  }

  async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const token = req.token as string;
      const result = await this.authService.logout(token);

      const message = 'User logged out successfully';
      logger.info(message, result);
      return res.status(200).json({ message: message, result });
    } catch (err) {
      next(err);
    }
  }
}
