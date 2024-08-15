import { ZodError } from 'zod';

export interface JwtPayload {
  id: string;
  exp: number;
}

interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult<T> {
  success: false;
  errors: ZodError<T>;
}

export type ValidationResult<T> = SuccessResult<T> | ErrorResult<T>;
