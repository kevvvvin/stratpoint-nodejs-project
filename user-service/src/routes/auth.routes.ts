import express from 'express';
import { authController } from '../container';
import { authenticateJWT, validateRequest, verifyInternalService } from '../middlewares';
import { loginSchema, registerSchema, serviceTokenSchema } from '../utils';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);
router.post('/login', validateRequest(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);
router.post('/logout', authenticateJWT, (req, res, next) =>
  authController.logout(req, res, next),
);
router.get('/validate-token', authenticateJWT, (req, res, next) =>
  authController.validateToken(req, res, next),
);

router.post(
  '/generate-service-token',
  verifyInternalService,
  validateRequest(serviceTokenSchema),
  (req, res, next) => authController.generateServiceToken(req, res, next),
);

export default router;
