import { Types, Document } from 'mongoose';
import {
  StatusEnum,
  RoleEnum,
  KycIdEnum,
  KycSubmissionStatusEnum,
  KycUserStatusEnum,
} from '../enums';

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
  _id: Types.ObjectId;
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
  _id: Types.ObjectId;
  token: string;
  expiresAt: Date;
}
