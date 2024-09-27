import express from 'express';
import { transactionController } from '../container';

// TODO: add validation middleware and request schemas

const router = express.Router();

router.post('/create', (req, res, next) => transactionController.create(req, res, next));

router.get('/status/:paymentIntentId', (req, res, next) =>
  transactionController.getPaymentStatus(req, res, next),
);

router.get('/transactions/:walletId', (req, res, next) =>
  transactionController.getTransactions(req, res, next),
);

export default router;
