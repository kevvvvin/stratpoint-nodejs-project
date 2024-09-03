import express from 'express';
import { notificationController } from '../container';
import { authenticateJWT, fetchAdminToken } from '../middlewares';

const router = express.Router();

router.post('/login-notification', authenticateJWT, fetchAdminToken, (req, res, next) =>
  notificationController.notifyLogin(req, res, next),
);

export default router;
