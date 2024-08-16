import { KycSubmissionStatusEnum } from '../enums';
import { IKyc } from '../types';
import { Kyc } from '../models';

export class KycRepository {
  async findById(id: string): Promise<IKyc | null> {
    return Kyc.findById(id).populate('user', 'email kycStatus');
  }

  async findByUserId(userId: string): Promise<IKyc | null> {
    return Kyc.findOne({ user: userId }).populate('user', 'email kycStatus');
  }

  async findAll(): Promise<IKyc[]> {
    return Kyc.find().populate('user', 'email kycStatus');
  }

  async create(userId: string, submissionStatus: KycSubmissionStatusEnum): Promise<IKyc> {
    let newKyc = Kyc.create({ user: userId, submissionStatus: submissionStatus });
    newKyc = (await newKyc).populate('user', 'email kycStatus');
    return newKyc;
  }

  async update(userId: string, updateData: Partial<IKyc>): Promise<IKyc | null> {
    return Kyc.findOneAndUpdate({ user: userId }, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', 'email kycStatus');
  }
}
