import express from 'express';
import { RoleEnum } from '../enums';
import { userController } from '../container';
import { authenticateJWT, authorizeRoles } from '../middlewares';

const router = express.Router();

router.get('/', authenticateJWT, authorizeRoles([RoleEnum.ADMIN]), (req, res, next) =>
  userController.getAllUsers(req, res, next),
);

router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles([RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.SERVICE]),
  (req, res, next) => userController.getUserById(req, res, next),
);

router.put('/update-kyc-status/:userId', authenticateJWT, (req, res, next) =>
  userController.updateKycStatus(req, res, next),
);

export default router;
