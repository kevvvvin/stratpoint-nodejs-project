import mongoose, { Schema } from 'mongoose';
import { KycIdEnum, KycSubmissionStatusEnum } from '../enums';
import { IKyc } from '../types';

const kycSchema = new Schema<IKyc>({
  userId: {
    type: Schema.Types.ObjectId,
    unique: true,
    required: true,
  },
  idType: {
    type: String,
    enum: Object.values(KycIdEnum),
  },
  idNumber: {
    type: String,
  },
  idExpiration: {
    type: Date,
  },
  submissionStatus: {
    type: String,
    enum: Object.values(KycSubmissionStatusEnum),
  },
});

export const Kyc = mongoose.model('Kyc', kycSchema);
