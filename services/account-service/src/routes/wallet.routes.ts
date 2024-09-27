import express from 'express';
import { walletController } from '../container';
import { validateRequest } from 'shared-common';
import {
  addPaymentMethodSchema,
  confirmPaymentIntentSchema,
  createPaymentIntentSchema,
  depositSchema,
  transferSchema,
  withdrawalSchema,
} from '../utils';

const router = express.Router();

router.post('/create', (req, res, next) => walletController.create(req, res, next));

router.get('/balance', (req, res, next) =>
  walletController.getWalletBalance(req, res, next),
);

router.post(
  '/add-payment-method',
  validateRequest(addPaymentMethodSchema),
  (req, res, next) => walletController.addPaymentMethod(req, res, next),
);

router.get('/payment-methods', (req, res, next) =>
  walletController.getPaymentMethods(req, res, next),
);

router.delete('/payment-methods/:paymentMethodId', (req, res, next) =>
  walletController.deletePaymentMethod(req, res, next),
);

router.post(
  '/create-payment-intent',
  validateRequest(createPaymentIntentSchema),
  (req, res, next) => walletController.createPaymentIntent(req, res, next),
);

router.post(
  '/confirm-payment-intent',
  validateRequest(confirmPaymentIntentSchema),
  (req, res, next) => walletController.confirmPaymentIntent(req, res, next),
);

router.get('/payment-status/:paymentIntentId', (req, res, next) =>
  walletController.getPaymentStatus(req, res, next),
);

router.post('/deposit', validateRequest(depositSchema), (req, res, next) =>
  walletController.deposit(req, res, next),
);

router.post('/withdraw', validateRequest(withdrawalSchema), (req, res, next) =>
  walletController.withdraw(req, res, next),
);

router.post('/transfer', validateRequest(transferSchema), (req, res, next) =>
  walletController.transfer(req, res, next),
);

router.get('/transactions', (req, res, next) =>
  walletController.getTransactions(req, res, next),
);

export default router;
