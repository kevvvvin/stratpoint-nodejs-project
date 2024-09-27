import express from 'express';
import { notificationController } from '../container';
import { fetchServiceToken } from '../middlewares';

// TODO: Add validation middleware and request schemas

const router = express.Router();

router.post('/login-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyLogin(req, res, next),
);

router.post('/email-verification-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyEmailVerification(req, res, next),
);

router.post('/kyc-update-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyKycUpdate(req, res, next),
);

router.post('/deposit-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyDeposit(req, res, next),
);

router.post('/withdraw-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyWithdraw(req, res, next),
);

router.post('/transfer-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyTransfer(req, res, next),
);

router.post('/wallet-creation-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyWalletCreation(req, res, next),
);

router.post('/add-payment-method-notification', fetchServiceToken, (req, res, next) =>
  notificationController.notifyPaymentMethodAdded(req, res, next),
);

export default router;
