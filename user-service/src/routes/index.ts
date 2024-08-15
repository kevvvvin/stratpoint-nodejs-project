import express, { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../utils/errors';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import kycRoutes from './kyc.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/kyc', kycRoutes);
router.use('*', (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
});

export default router;
