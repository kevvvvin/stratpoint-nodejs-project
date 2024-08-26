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

router.post('/retrieve-payment-method', authenticateJWT, (req, res, next) =>
  stripeController.retrievePaymentMethod(req, res, next),
);

router.post('/attach-payment-method', authenticateJWT, (req, res, next) =>
  stripeController.attachPaymentMethod(req, res, next),
);

router.post('/detach-payment-method', authenticateJWT, (req, res, next) =>
  stripeController.detachPaymentMethod(req, res, next),
);

router.post('/create-payment-intent', authenticateJWT, (req, res, next) =>
  stripeController.createPaymentIntent(req, res, next),
);

router.post('/confirm-payment-intent', authenticateJWT, (req, res, next) =>
  stripeController.confirmPaymentIntent(req, res, next),
);

router.post('/create-payout', authenticateJWT, (req, res, next) =>
  stripeController.createPayout(req, res, next),
);

export default router;
