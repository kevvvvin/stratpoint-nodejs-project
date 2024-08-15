import { Types } from 'mongoose';

interface KycDetails {
  id: Types.ObjectId;
  user: Types.ObjectId;
  idType: string;
  idNumber: string;
  idExpiration: Date;
  submissionStatus: string;
}

export interface KycResult {
  kyc: KycDetails;
}
