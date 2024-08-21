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

export default router;
