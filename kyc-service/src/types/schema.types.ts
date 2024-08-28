import { Types, Document } from 'mongoose';
import { KycIdEnum, KycSubmissionStatusEnum } from '../enums';

export interface IKyc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  idType: KycIdEnum;
  idNumber: string;
  idExpiration: Date;
  submissionStatus: KycSubmissionStatusEnum;
}
