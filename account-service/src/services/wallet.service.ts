import { WalletResult } from '../types';
import { WalletRepository } from '../repositories';

export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  async create(userId: string): Promise<WalletResult> {
    /*
      TODO: accept a user id, ideally taken from the JWT token
      validate that the user does not already have an account (only one account allowed per user)
    */
    const wallet = await this.walletRepository.create(userId);

    const createResult: WalletResult = {
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
    };

    return createResult;
  }

  async getWalletByUserId(userId: string): Promise<WalletResult> {
    /*
      TODO: accept a user id, ideally taken from the JWT token
      validate that the user has access to the wallet (users can access only their own wallets regardless of roles)
    */

    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const walletResult: WalletResult = {
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
    };

    return walletResult;
  }
}
