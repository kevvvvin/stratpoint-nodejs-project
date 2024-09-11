import express, { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../utils';
import transactionRoutes from './transaction.routes';

const router = express.Router();

router.use('/transaction', transactionRoutes);
router.use('*', (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
});

export default router;
