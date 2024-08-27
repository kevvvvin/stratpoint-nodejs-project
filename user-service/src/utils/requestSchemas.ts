import { z } from 'zod';
import { KycIdEnum } from '../enums';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name must be at most 50 characters long'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name must be at most 50 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const kycSchema = z.object({
  idType: z.nativeEnum(KycIdEnum, {
    errorMap: () => ({ message: 'Invalid ID type. Please choose a valid option.' }),
  }),
  idNumber: z.string().min(1, 'ID number is required.'),
  idExpiration: z.string().date('Invalid date format. Expected YYYY-MM-DD'),
});
