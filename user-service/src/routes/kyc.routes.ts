import express from 'express';
import { kycController } from '../container';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { RoleEnum } from '../enums/role.enum';

const router = express.Router();

router.post(
  '/initiate/:id',
  authenticateJWT,
  authorizeRoles([RoleEnum.USER, RoleEnum.ADMIN]),
  (req, res, next) => kycController.initiate(req, res, next),
);

router.post(
  '/submit/:id',
  authenticateJWT,
  authorizeRoles([RoleEnum.USER, RoleEnum.ADMIN]),
  (req, res, next) => kycController.submit(req, res, next),
);

export default router;
