import express from 'express';
import UserController from '../controllers/user.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { RoleEnum } from '../enums/role.enum';

const router = express.Router();

router.get(
  '/',
  authenticateJWT,
  authorizeRoles([RoleEnum.ADMIN]),
  UserController.getAllUsers,
);

router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles([RoleEnum.USER, RoleEnum.ADMIN]),
  UserController.getUserById,
);

export default router;
