import express, { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../utils';
import customerRoutes from './customer.routes';

const router = express.Router();

router.use('/customer', customerRoutes);
router.use('*', (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
});

export default router;
