import { WalletResult } from '../types';
import { WalletRepository } from '../repositories';

export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  async create(userId: string): Promise<WalletResult> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (wallet) throw new Error('Wallet creation failed. Wallet already exists.');

    const newWallet = await this.walletRepository.create(userId);
    const createResult: WalletResult = {
      wallet: {
        _id: newWallet._id,
        user: newWallet.user,
        balance: newWallet.balance,
        currency: newWallet.currency,
        stripeCustomerId: newWallet.stripeCustomerId,
      },
    };

    return createResult;
  }

  async getWalletBalance(userId: string): Promise<WalletResult> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const walletResult: WalletResult = {
      wallet: {
        _id: wallet._id,
        user: wallet.user,
        balance: wallet.balance,
        currency: wallet.currency,
        stripeCustomerId: wallet.stripeCustomerId,
      },
    };

    return walletResult;
  }
}
