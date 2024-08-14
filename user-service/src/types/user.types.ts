import { Types } from 'mongoose';
import { StatusEnum } from '../enums/status.enum';
import { KycUserStatusEnum } from '../enums/kyc.enum';

export interface UserDetails {
  id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  status: StatusEnum;
  kycStatus: KycUserStatusEnum;
  roles: string[];
}

export interface UserResponseBody {
  user: UserDetails;
}

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

export interface AuthResponseBody {
  token: string;
  user: UserDetails;
}
