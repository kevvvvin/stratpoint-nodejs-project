import { Request, Response, NextFunction } from 'express';
import { AuthResult } from '../types';
import { AuthService } from '../services';
import { AuthResponseDto } from '../dtos';
import { validateLogin, validateRegister, handleValidationError, logger } from '../utils';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    const requestValidation = validateRegister(req.body);
    if (!requestValidation.success) {
      return handleValidationError(requestValidation.errors, next);
    }

    try {
      const result: AuthResult = await this.authService.register(req.body);
      const message = 'User registered successfully';
      const response = new AuthResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const requestValidation = validateLogin(req.body);
    if (!requestValidation.success) {
      return handleValidationError(requestValidation.errors, next);
    }

    try {
      const result: AuthResult = await this.authService.login(req.body);
      const message = 'User logged in successfully';
      const response = new AuthResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
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
      const response = new AuthResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
