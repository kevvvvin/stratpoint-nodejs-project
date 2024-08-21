import { Wallet } from '../models';
import { IWallet } from '../types';

export class WalletRepository {
  async create(userId: string, customerId: string): Promise<IWallet> {
    return Wallet.create({ user: userId, stripeCustomerId: customerId });
  }

  async findByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ user: userId });
  }
}
