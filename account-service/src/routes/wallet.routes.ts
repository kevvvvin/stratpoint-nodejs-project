import express from 'express';
import { walletController } from '../container';

const router = express.Router();

router.post('/create', (req, res, next) => walletController.create(req, res, next));
router.get('/', (req, res, next) => walletController.getWalletByUserId(req, res, next));

export default router;
