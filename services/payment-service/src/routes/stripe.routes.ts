import express from 'express';
import { stripeController } from '../container';

// TODO: Add validation middleware and request schemas

const router = express.Router();

router.post('/create-customer-id', (req, res, next) =>
  stripeController.createCustomerId(req, res, next),
);

// router.post('/create-payment-method', (req, res, next) =>
//   stripeController.createPaymentMethod(req, res, next),
// );

router.get('/payment-methods', (req, res, next) =>
  stripeController.getPaymentMethods(req, res, next),
);

router.post('/retrieve-payment-method', (req, res, next) =>
  stripeController.retrievePaymentMethod(req, res, next),
);

router.post('/attach-payment-method', (req, res, next) =>
  stripeController.attachPaymentMethod(req, res, next),
);

router.post('/detach-payment-method', (req, res, next) =>
  stripeController.detachPaymentMethod(req, res, next),
);

router.post('/create-payment-intent', (req, res, next) =>
  stripeController.createPaymentIntent(req, res, next),
);

router.post('/confirm-payment-intent', (req, res, next) =>
  stripeController.confirmPaymentIntent(req, res, next),
);

router.post('/create-payout', (req, res, next) =>
  stripeController.createPayout(req, res, next),
);

export default router;
