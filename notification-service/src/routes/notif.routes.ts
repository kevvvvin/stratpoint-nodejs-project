import express from 'express';
import { notificationController } from '../container';
import { authenticateJWT, fetchAdminToken } from '../middlewares';

const router = express.Router();

router.post('/login-notification', authenticateJWT, fetchAdminToken, (req, res, next) =>
  notificationController.notifyLogin(req, res, next),
);

router.post('/deposit-notification', authenticateJWT, fetchAdminToken, (req, res, next) =>
  notificationController.notifyDeposit(req, res, next),
);

router.post(
  '/withdraw-notification',
  authenticateJWT,
  fetchAdminToken,
  (req, res, next) => notificationController.notifyWithdraw(req, res, next),
);

router.post(
  '/transfer-notification',
  authenticateJWT,
  fetchAdminToken,
  (req, res, next) => notificationController.notifyTransfer(req, res, next),
);

router.post(
  '/wallet-creation-notification',
  authenticateJWT,
  fetchAdminToken,
  (req, res, next) => notificationController.notifyWalletCreation(req, res, next),
);

router.post(
  '/add-payment-method-notification',
  authenticateJWT,
  fetchAdminToken,
  (req, res, next) => notificationController.notifyPaymentMethodAdded(req, res, next),
);

export default router;
