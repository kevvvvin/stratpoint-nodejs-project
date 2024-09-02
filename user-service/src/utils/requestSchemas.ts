import { z } from 'zod';

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
