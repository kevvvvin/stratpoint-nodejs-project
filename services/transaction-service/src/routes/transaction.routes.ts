import express from 'express';
import { transactionController } from '../container';
import { authenticateJWT } from '../middlewares';

const router = express.Router();

router.post('/create', authenticateJWT, (req, res, next) =>
  transactionController.create(req, res, next),
);

router.get('/status/:paymentIntentId', authenticateJWT, (req, res, next) =>
  transactionController.getPaymentStatus(req, res, next),
);

router.get('/transactions/:walletId', authenticateJWT, (req, res, next) =>
  transactionController.getTransactions(req, res, next),
);

export default router;
