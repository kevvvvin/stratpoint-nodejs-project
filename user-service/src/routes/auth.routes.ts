import express from 'express';
import { authController } from '../container';
import { authenticateJWT } from '../middlewares';

const router = express.Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', authenticateJWT, (req, res, next) =>
  authController.logout(req, res, next),
);
router.get('/validate-token', authenticateJWT, (req, res, next) =>
  authController.validateToken(req, res, next),
);

export default router;
