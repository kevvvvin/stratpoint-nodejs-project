import { KycSubmissionStatusEnum } from '../enums';
import { IKyc } from '../types';
import { Kyc } from '../models';
import { Types } from 'mongoose';

export class KycRepository {
  async findById(id: string): Promise<IKyc | null> {
    return await Kyc.findById(new Types.ObjectId(id));
  }

  async findByUserId(userId: string): Promise<IKyc | null> {
    return await Kyc.findOne({ user: new Types.ObjectId(userId) });
  }

  async findAll(): Promise<IKyc[]> {
    return await Kyc.find();
  }

  async create(userId: string, submissionStatus: KycSubmissionStatusEnum): Promise<IKyc> {
    return Kyc.create({
      user: new Types.ObjectId(userId),
      submissionStatus: submissionStatus,
    });
  }

  async update(userId: string, updateData: Partial<IKyc>): Promise<IKyc | null> {
    return await Kyc.findOneAndUpdate({ user: new Types.ObjectId(userId) }, updateData, {
      new: true,
      runValidators: true,
    });
  }
}
