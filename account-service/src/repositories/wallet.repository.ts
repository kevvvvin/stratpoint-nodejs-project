import { Types } from 'mongoose';
import { Wallet } from '../models';
import { IWallet } from '../types';

export class WalletRepository {
  async create(userId: string, customerId: string): Promise<IWallet> {
    return await Wallet.create({
      user: new Types.ObjectId(userId),
      stripeCustomerId: customerId,
    });
  }

  async findByUserId(userId: string): Promise<IWallet | null> {
    return await Wallet.findOne({ user: new Types.ObjectId(userId) });
  }
}
