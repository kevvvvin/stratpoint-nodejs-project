import { KycIdEnum } from '../enums/kyc.enum';

export interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface KycSubmissionBody {
  idType: KycIdEnum;
  idNumber: string;
  idExpiration: string;
}
