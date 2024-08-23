import express from 'express';
import { transactionController } from '../container';
import { authenticateJWT } from '../middlewares';

const router = express.Router();

router.post('/create', authenticateJWT, (req, res, next) =>
  transactionController.create(req, res, next),
);

export default router;
