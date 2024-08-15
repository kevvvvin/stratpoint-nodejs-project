import { Types } from 'mongoose';
import { StatusEnum, KycUserStatusEnum } from '../enums';

export interface UserDetails {
  id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  status: StatusEnum;
  kycStatus: KycUserStatusEnum;
  roles: string[];
}

export interface AuthResult {
  token: string;
  user: UserDetails;
}

export interface UserResult {
  user: UserDetails | UserDetails[];
}
