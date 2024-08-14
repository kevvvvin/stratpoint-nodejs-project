import { Types } from 'mongoose';
import { RoleEnum } from '../enums/role.enum';
import { StatusEnum } from '../enums/status.enum';
import { KycIdEnum, KycSubmissionStatusEnum, KycUserStatusEnum } from '../enums/kyc.enum';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  status: StatusEnum;
  kycStatus: KycUserStatusEnum;
  roles: IRole[];
  checkPassword(candidatePassword: string): Promise<boolean>;
}

export interface IRole extends Document {
  name: RoleEnum;
  description: string;
}

export interface IKyc extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  idType: KycIdEnum;
  idNumber: string;
  idExpiration: Date;
  submissionStatus: KycSubmissionStatusEnum;
}

export interface ITokenBlacklist extends Document {
  token: string;
  expiresAt: Date;
}
