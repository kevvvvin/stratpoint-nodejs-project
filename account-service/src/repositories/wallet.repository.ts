import { Wallet } from '../models';
import { IWallet } from '../types';

export class WalletRepository {
  async create(userId: string): Promise<IWallet> {
    return Wallet.create({ user: userId });
  }
  async findById(id: string): Promise<IWallet | null> {
    return Wallet.findById(id);
  }

  async findByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId });
  }
}
