import { z, ZodError, ZodSchema } from 'zod';
import { NextFunction } from 'express';
import { KycIdEnum } from '../enums';
import { ValidationResult } from '../types';
import { LoginRequestDto, RegisterRequestDto, KycSubmitRequestDto } from '../dtos';
import { RequestValidationError } from './errors';

function parseSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) return { success: true, data: result.data };
  else return { success: false, errors: result.error };
}

export const validateRegister = (
  data: RegisterRequestDto,
): ValidationResult<RegisterRequestDto> => {
  const registerSchema = z.object({
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
  return parseSchema(registerSchema, data);
};

export const validateLogin = (
  data: LoginRequestDto,
): ValidationResult<LoginRequestDto> => {
  const loginSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
  });
  return parseSchema(loginSchema, data);
};

export const validateKyc = (
  data: KycSubmitRequestDto,
): ValidationResult<KycSubmitRequestDto> => {
  const kycSchema = z.object({
    idType: z.nativeEnum(KycIdEnum, {
      errorMap: () => ({ message: 'Invalid ID type. Please choose a valid option.' }),
    }),
    idNumber: z.string().min(1, 'ID number is required.'),
    idExpiration: z.string().date('Invalid date format. Expected YYYY-MM-DD'),
  });

  return parseSchema(kycSchema, data);
};

export function handleValidationError(error: ZodError, next: NextFunction): void {
  const errorMessages = error.errors.map((issue) => issue.message).join(', ');

  const validationError = new RequestValidationError(errorMessages);
  next(validationError);
}
