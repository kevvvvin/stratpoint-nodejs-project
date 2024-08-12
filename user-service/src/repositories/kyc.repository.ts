import { KycSubmissionStatusEnum } from '../enums/kyc.enum';
import Kyc from '../models/kyc.model';
import { IKyc } from '../types/schema.types';

export class KycRepository {
  async findById(id: string): Promise<IKyc | null> {
    return Kyc.findById(id).populate('userId', 'email');
  }

  async findByUserId(userId: string): Promise<IKyc | null> {
    return Kyc.findOne({ userId }).populate('userId', 'email');
  }

  async findAll(): Promise<IKyc[]> {
    return Kyc.find().populate('userId', 'email');
  }

  async initiate(userId: string): Promise<IKyc> {
    const kyc = new Kyc({ userId, submission_status: KycSubmissionStatusEnum.INITIATED });
    await kyc.save();
    return kyc;
  }

  async update(id: string, updateData: Partial<IKyc>): Promise<IKyc | null> {
    return Kyc.findByIdAndUpdate(id, updateData, {
      submission_status: KycSubmissionStatusEnum.FOR_REVIEW,
      new: true,
    });
  }
}
