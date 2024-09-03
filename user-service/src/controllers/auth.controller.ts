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
      const registerData: RegisterRequestDto = req.body;
      const result: UserResult = await this.authService.register(registerData);
      const message = 'User registered successfully';
      const response = new UserResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const loginData: LoginRequestDto = req.body;
      const result: AuthResult = await this.authService.login(loginData);
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
      const user = req.user as IUser;

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

  async generateAdminToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const isInternalRequest = req.headers['x-internal-service'] === 'true';
      if (!isInternalRequest)
        throw new Error('Forbidden. Not authorized to generate admin token');

      const serviceName = req.params.serviceName;

      const message = 'Generated an admin token successfully';
      const result = await this.authService.generateAdminToken(serviceName);

      logger.info({ message, result });
      return res.status(201).json({ message, result });
    } catch (err) {
      next(err);
    }
  }
}
