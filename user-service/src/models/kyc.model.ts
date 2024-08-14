import mongoose, { Schema } from 'mongoose';
import { KycIdEnum, KycSubmissionStatusEnum } from '../enums/kyc.enum';
import { IKyc } from '../types/schema.types';

const kycSchema = new Schema<IKyc>({
  user: {
    type: Schema.Types.ObjectId,
    unique: true,
    ref: 'User',
    required: true,
  },
  idType: {
    type: String,
    enum: Object.values(KycIdEnum),
  },
  idNumber: {
    type: String,
    unique: true,
  },
  idExpiration: {
    type: Date,
  },
  submissionStatus: {
    type: String,
    enum: Object.values(KycSubmissionStatusEnum),
  },
});

const Kyc = mongoose.model('Kyc', kycSchema);

export default Kyc;
