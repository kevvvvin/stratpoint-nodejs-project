import { Request, Response, NextFunction } from 'express';
import { AuthResult, IUser, UserResult } from '../types';
import { AuthService } from '../services';
import {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserResponseDto,
} from '../dtos';
import { logger } from '../utils';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const registerData: RegisterRequestDto = req.body;
      const result: UserResult = await this.authService.register(
        serviceToken,
        registerData,
      );
      const message = 'User registered successfully';
      const response = new UserResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const emailVerificationToken = req.params.token;

      const result = await this.authService.verifyEmail(emailVerificationToken);
      const message = 'Email verified successfully';

      logger.info({ message, result });
      return res.status(200).json({ message, result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const serviceToken = res.locals.serviceToken as string;
      const loginData: LoginRequestDto = req.body;
      const result: AuthResult = await this.authService.login(serviceToken, loginData);
      const message = 'User logged in successfully';
      const response = new AuthResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async logout(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const token = res.locals.token as string;
      const user = res.locals.user as IUser;

      const result = await this.authService.logout(token, user);
      const message = 'User logged out successfully. Token has been revoked';
      const response = new AuthResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async validateToken(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      return res.status(200).json({ valid: true });
    } catch (err) {
      next(err);
    }
  }

  async generateServiceToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { serviceName } = req.body;

      const result = await this.authService.generateServiceToken(serviceName);
      const message = `Generated a ${serviceName} token for microservices communication successfully`;

      logger.info({ message, result });
      return res.status(201).json({ message, result });
    } catch (err) {
      next(err);
    }
  }
}
