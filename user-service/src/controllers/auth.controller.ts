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

      logger.info('User registered successfully', result);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const result: AuthResponseBody = await this.authService.login(req.body);

      logger.info('User logged in successfully', result);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    // const { error } = validator.validateLogin(req.body);
    // if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const result = await this.authService.logout();

      logger.info('User logged out successfully', result);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
