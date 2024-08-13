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

  async create(userId: string, submissionStatus: KycSubmissionStatusEnum): Promise<IKyc> {
    return Kyc.create({ userId, submissionStatus });
  }

  async update(id: string, updateData: Partial<IKyc>): Promise<IKyc | null> {
    return Kyc.findOneAndUpdate({ userId: id }, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'email');
  }
}
