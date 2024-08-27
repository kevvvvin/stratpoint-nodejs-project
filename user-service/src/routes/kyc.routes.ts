import express from 'express';
import { RoleEnum } from '../enums';
import { kycController } from '../container';
import { authenticateJWT, authorizeRoles, validateRequest } from '../middlewares';
import { kycSchema } from '../utils';

const router = express.Router();

router.post(
  '/initiate',
  authenticateJWT,
  authorizeRoles([RoleEnum.USER, RoleEnum.ADMIN]),
  (req, res, next) => kycController.initiate(req, res, next),
);

router.put(
  '/submit',
  validateRequest(kycSchema),
  authenticateJWT,
  authorizeRoles([RoleEnum.USER, RoleEnum.ADMIN]),
  (req, res, next) => kycController.submit(req, res, next),
);

router.post(
  '/approve/:id',
  authenticateJWT,
  authorizeRoles([RoleEnum.ADMIN]),
  (req, res, next) => kycController.approve(req, res, next),
);

router.post(
  '/reject/:id',
  authenticateJWT,
  authorizeRoles([RoleEnum.ADMIN]),
  (req, res, next) => kycController.reject(req, res, next),
);

router.get('/', authenticateJWT, authorizeRoles([RoleEnum.ADMIN]), (req, res, next) =>
  kycController.getAllKyc(req, res, next),
);

router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles([RoleEnum.USER, RoleEnum.ADMIN]),
  (req, res, next) => kycController.getKycByUserId(req, res, next),
);

export default router;
