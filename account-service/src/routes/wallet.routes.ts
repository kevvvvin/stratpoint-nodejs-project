import express from 'express';
import { walletController } from '../container';
import { authenticateJWT } from '../middlewares';

const router = express.Router();

router.post('/create', authenticateJWT, (req, res, next) =>
  walletController.create(req, res, next),
);

router.get('/balance', authenticateJWT, (req, res, next) =>
  walletController.getWalletBalance(req, res, next),
);

router.post('/add-payment-method', authenticateJWT, (req, res, next) =>
  walletController.addPaymentMethod(req, res, next),
);

router.get('/payment-methods', authenticateJWT, (req, res, next) =>
  walletController.getPaymentMethods(req, res, next),
);

router.delete('/payment-methods/:paymentMethodId', authenticateJWT, (req, res, next) =>
  walletController.deletePaymentMethod(req, res, next),
);

router.post('/create-payment-intent', authenticateJWT, (req, res, next) =>
  walletController.createPaymentIntent(req, res, next),
);

router.post('/confirm-payment-intent', authenticateJWT, (req, res, next) =>
  walletController.confirmPaymentIntent(req, res, next),
);

router.get('/payment-status/:paymentIntentId', authenticateJWT, (req, res, next) =>
  walletController.getPaymentStatus(req, res, next),
);

router.post('/deposit', authenticateJWT, (req, res, next) =>
  walletController.deposit(req, res, next),
);

router.post('/withdraw', authenticateJWT, (req, res, next) =>
  walletController.withdraw(req, res, next),
);

router.post('/transfer', authenticateJWT, (req, res, next) =>
  walletController.transfer(req, res, next),
);

router.get('/transactions', authenticateJWT, (req, res, next) =>
  walletController.getTransactions(req, res, next),
);

export default router;
