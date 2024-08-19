import { ZodError } from 'zod';
import { KycUserStatusEnum, StatusEnum } from '../enums';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  status: StatusEnum;
  kycStatus: KycUserStatusEnum;
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
