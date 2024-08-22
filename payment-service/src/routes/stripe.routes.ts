import express from 'express';
import { stripeController } from '../container';
import { authenticateJWT } from '../middlewares';

const router = express.Router();

router.post('/create-customer-id', authenticateJWT, (req, res, next) =>
  stripeController.createCustomerId(req, res, next),
);

router.post('/create-payment-method', authenticateJWT, (req, res, next) =>
  stripeController.createPaymentMethod(req, res, next),
);

router.get('/payment-methods', authenticateJWT, (req, res, next) =>
  stripeController.getPaymentMethods(req, res, next),
);

export default router;
