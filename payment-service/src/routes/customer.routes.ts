import express from 'express';
import { customerController } from '../container';
import { authenticateJWT } from '../middlewares';

const router = express.Router();

router.post('/create', authenticateJWT, (req, res, next) =>
  customerController.create(req, res, next),
);

export default router;
