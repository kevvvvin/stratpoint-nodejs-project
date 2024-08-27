import { z } from 'zod';

export const addPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method ID is required.'),
});

export const createPaymentIntentSchema = z.object({
  amount: z.number().min(1, 'Amount greater than 0 is required'),
});

export const confirmPaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

export const depositSchema = z.object({
  amount: z.number().min(1, 'Amount greater than 0 is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

export const withdrawalSchema = z.object({
  amount: z.number().min(1, 'Amount greater than 0 is required'),
});

export const transferSchema = z.object({
  toUserId: z.string().min(1, 'User ID is required'),
  amount: z.number().min(1, 'Amount greater than 0 is required'),
});
