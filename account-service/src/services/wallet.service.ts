import { JwtPayload, WalletResult } from '../types';
import { WalletRepository } from '../repositories';

export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  async create(userDetails: JwtPayload, authHeader: string): Promise<WalletResult> {
    const wallet = await this.walletRepository.findByUserId(userDetails.sub);
    if (wallet) throw new Error('Wallet creation failed. Wallet already exists.');

    const customerResponse = await fetch(
      'http://localhost:3004/api/stripe/create-customer-id',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );

    if (customerResponse.status !== 201)
      throw new Error('Wallet creation failed. Customer creation failed.');

    const customer = await customerResponse.json();
    const newWallet = await this.walletRepository.create(
      userDetails.sub,
      customer.result.id as string,
    );
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
