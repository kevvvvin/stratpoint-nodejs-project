import express, { NextFunction, Request, Response } from 'express';
import { NotFoundError } from 'shared-common';
import notifRoutes from './notif.routes';

const router = express.Router();

router.use('/notif', notifRoutes);
router.use('*', (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
});

export default router;
