import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import kycRoutes from './kyc.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/kyc', kycRoutes);

export default router;
