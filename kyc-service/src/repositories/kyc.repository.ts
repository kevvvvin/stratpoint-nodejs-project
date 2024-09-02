import { KycSubmissionStatusEnum } from '../enums';
import { IKyc } from '../types';
import { Kyc } from '../models';
import { Types } from 'mongoose';

export class KycRepository {
  async findById(id: string): Promise<IKyc | null> {
    return await Kyc.findById(new Types.ObjectId(id));
  }

  async findByUserId(userId: string): Promise<IKyc | null> {
    return await Kyc.findOne({ userId: new Types.ObjectId(userId) });
  }

  async findAll(): Promise<IKyc[]> {
    return await Kyc.find();
  }

  async create(userId: string, submissionStatus: KycSubmissionStatusEnum): Promise<IKyc> {
    return Kyc.create({
      userId: new Types.ObjectId(userId),
      submissionStatus: submissionStatus,
    });
  }

  async update(userId: string, updateData: Partial<IKyc>): Promise<IKyc | null> {
    return await Kyc.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );
  }
}
