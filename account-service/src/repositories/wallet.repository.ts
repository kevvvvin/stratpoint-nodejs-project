import { Wallet } from '../models';
import { IWallet } from '../types';

export class WalletRepository {
  async create(): Promise<IWallet> {
    return Wallet.create({});
  }
  async findById(id: string): Promise<IWallet | null> {
    return Wallet.findById(id);
  }

  async findByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId });
  }
}
