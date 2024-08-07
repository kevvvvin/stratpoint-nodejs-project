import { Request, Response, NextFunction } from 'express';
import { RegisterRequestBody, LoginRequestBody } from '../types/auth.types';
import validator from '../utils/validator';
import logger from '../utils/logger';
import { AuthService } from '../services/auth.service';

const register = async (
  req: Request<RegisterRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const { error } = validator.validateUser(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const result = await AuthService.register(req.body);

    logger.info('User registered successfully', result);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (
  req: Request<LoginRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const { error } = validator.validateLogin(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const result = await AuthService.login(req.body);

    logger.info('User logged in successfully', result);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const AuthController = {
  register,
  login,
};

export default AuthController;
