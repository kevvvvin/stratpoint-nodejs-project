import { Types } from 'mongoose';
import { KycIdEnum } from '../enums/kyc.enum';

interface KycDetails {
  id: Types.ObjectId;
  user: Types.ObjectId;
  idType: string;
  idNumber: string;
  idExpiration: Date;
  submissionStatus: string;
}

export interface KycParams {
  id: string;
}

export interface KycSubmissionBody {
  idType: KycIdEnum;
  idNumber: string;
  idExpiration: string;
}

export interface KycResponseBody {
  kyc: KycDetails;
}
