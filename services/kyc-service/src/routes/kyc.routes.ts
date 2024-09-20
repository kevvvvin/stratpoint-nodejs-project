import express from 'express';
import { kycController } from '../container';
import { validateRequest } from 'shared-common';
import { kycSchema } from '../utils';

const router = express.Router();

router.post('/initiate', (req, res, next) => kycController.initiate(req, res, next));

router.put('/submit', validateRequest(kycSchema), (req, res, next) =>
  kycController.submit(req, res, next),
);

router.post('/approve/:id', (req, res, next) => kycController.approve(req, res, next));

router.post('/reject/:id', (req, res, next) => kycController.reject(req, res, next));

router.get('/', (req, res, next) => kycController.getAllKyc(req, res, next));

router.get('/:id', (req, res, next) => kycController.getKycByUserId(req, res, next));

export default router;
