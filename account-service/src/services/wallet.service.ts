import { IPaymentMethod, JwtPayload, WalletResult } from '../types';
import { WalletRepository, PaymentMethodRepository } from '../repositories';
import { Types } from 'mongoose';

export class WalletService {
  constructor(
    private walletRepository: WalletRepository,
    private paymentMethodRepository: PaymentMethodRepository,
  ) {}

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

  async addPaymentMethod(
    userId: string,
    paymentMethodId: string,
    authHeader: string,
  ): Promise<IPaymentMethod> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const existingPaymentMethod =
      await this.paymentMethodRepository.findByPaymentMethodId(paymentMethodId);
    if (existingPaymentMethod)
      throw new Error(`Payment method ${paymentMethodId} already exists for ${userId}`);

    const retrieveResponse = await fetch(
      'http://localhost:3004/api/stripe/retrieve-payment-method',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      },
    );
    if (retrieveResponse.status !== 200)
      throw new Error('Payment method retrieval failed.');

    const retrievedPaymentMethod = (await retrieveResponse.json()).result;

    const attachResponse = await fetch(
      'http://localhost:3004/api/stripe/attach-payment-method',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId, customerId: wallet.stripeCustomerId }),
      },
    );
    if (attachResponse.status !== 200)
      throw new Error('Payment method attachment to customer failed');

    const newPaymentMethod = this.paymentMethodRepository.create({
      user: new Types.ObjectId(userId),
      stripePaymentMethodId: paymentMethodId,
      type: retrievedPaymentMethod.type as string,
      card: {
        brand: retrievedPaymentMethod.card.brand as string,
        last4: retrievedPaymentMethod.card.last4 as string,
        expMonth: retrievedPaymentMethod.card.exp_month as number,
        expYear: retrievedPaymentMethod.card.exp_year as number,
      },
      isDefault: false,
    });

    return newPaymentMethod;
  }
}
