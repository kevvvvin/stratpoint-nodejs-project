import {
  IPaymentMethod,
  JwtPayload,
  PaymentMethodResult,
  WalletResult,
  STRIPE_TEST_PAYMENT_METHODS,
  CreatePaymentIntentResult,
  ConfirmPaymentIntentResult,
  PaymentStatusResult,
  PayoutResult,
  TransferResult,
  TransactionResult,
} from '../types';
import { WalletRepository, PaymentMethodRepository } from '../repositories';
import { Types } from 'mongoose';
import { logger } from '../utils';
import { PaymentIntentRequestDto, TransactionRequestDto } from '../dtos';
import crypto from 'crypto';

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

  async getPaymentMethods(userId: string): Promise<PaymentMethodResult[]> {
    const paymentMethods =
      await this.paymentMethodRepository.findUserPaymentMethods(userId);
    const methodResults: PaymentMethodResult[] = paymentMethods.map((paymentMethod) => ({
      paymentMethod: {
        user: paymentMethod.user,
        stripePaymentMethodId: paymentMethod.stripePaymentMethodId,
        type: paymentMethod.type,
        card: {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.expMonth,
          expYear: paymentMethod.card.expYear,
        },
        isDefault: paymentMethod.isDefault,
      },
    }));
    return methodResults;
  }

  async deletePaymentMethod(
    userId: string,
    paymentMethodId: string,
    authHeader: string,
  ): Promise<IPaymentMethod> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const paymentMethod = await this.paymentMethodRepository.findUserPaymentMethod(
      userId,
      paymentMethodId,
    );
    if (!paymentMethod) throw new Error('Payment method does not exist.');

    if (STRIPE_TEST_PAYMENT_METHODS.has(paymentMethodId)) {
      logger.info('Payment method is a test card. Proceeding with local deletion');
      await this.paymentMethodRepository.delete(paymentMethod._id);
      return paymentMethod;
    }

    const detachResponse = await fetch(
      'http://localhost:3004/api/stripe/detach-payment-method',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      },
    );

    if (detachResponse.status !== 200) {
      logger.warn(
        'Payment method detachment to customer failed. Proceeding with local deletion',
      );
    }

    await this.paymentMethodRepository.delete(paymentMethod._id);

    return paymentMethod;
  }

  async createPaymentIntent(
    authHeader: string,
    amount: number,
    userId: string,
  ): Promise<CreatePaymentIntentResult> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const paymentIntentRequest = new PaymentIntentRequestDto(
      amount,
      wallet.currency,
      wallet.stripeCustomerId,
    );
    const paymentIntentResponse = await fetch(
      'http://localhost:3004/api/stripe/create-payment-intent',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentIntentRequest),
      },
    );

    if (paymentIntentResponse.status !== 201) {
      throw new Error('Payment intent creation failed');
    }

    const paymentIntent = (await paymentIntentResponse.json()).result;

    return {
      paymentIntent: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    };
  }

  async confirmPaymentIntent(
    authHeader: string,
    userId: string,
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<ConfirmPaymentIntentResult> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const paymentMethod = await this.paymentMethodRepository.findUserPaymentMethod(
      userId,
      paymentMethodId,
    );
    if (!paymentMethod) throw new Error('Payment method does not exist.');

    let paymentIntent;
    if (STRIPE_TEST_PAYMENT_METHODS.has(paymentMethodId)) {
      paymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 5000,
      };
      logger.info('Simulated payment intent confirmation for test payment method');
    } else {
      const paymentIntentResponse = await fetch(
        'http://localhost:3004/api/stripe/confirm-payment-intent',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentIntentId, paymentMethodId }),
        },
      );
      if (paymentIntentResponse.status !== 200) {
        throw new Error('Payment intent confirmation failed');
      }
      paymentIntent = (await paymentIntentResponse.json()).result;
    }

    if (paymentIntent.status === 'succeeded') {
      const amount = paymentIntent.amount / 100;
      wallet.balance += amount;
      await wallet.save();

      const transactionRequestDto = new TransactionRequestDto(
        'deposit',
        amount,
        null,
        wallet._id.toString(),
        paymentIntent.id,
      );
      const transactionResponse = await fetch(
        'http://localhost:3003/api/transaction/create',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionRequestDto),
        },
      );
      if (transactionResponse.status !== 201) {
        logger.warn('Transaction creation on payment intent confirm failed');
      }

      return { balance: wallet.balance, transactionId: paymentIntent.id };
    } else {
      throw new Error('Payment failed');
    }
  }

  async getPaymentStatus(
    authHeader: string,
    paymentIntentId: string,
  ): Promise<PaymentStatusResult> {
    const transactionResponse = await fetch(
      'http://localhost:3003/api/transaction/status/' + paymentIntentId,
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );

    if (transactionResponse.status !== 200) {
      throw new Error('Payment status check failed');
    }

    const transaction = (await transactionResponse.json()).result;

    return {
      stripePaymentIntentId: transaction.stripePaymentIntentId,
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async deposit(
    authHeader: string,
    userId: string,
    amount: number,
    paymentMethodId: string,
  ): Promise<ConfirmPaymentIntentResult> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const paymentMethod = await this.paymentMethodRepository.findUserPaymentMethod(
      userId,
      paymentMethodId,
    );
    if (!paymentMethod) throw new Error('Payment method does not exist.');

    let paymentIntent;
    if (STRIPE_TEST_PAYMENT_METHODS.has(paymentMethodId)) {
      paymentIntent = {
        id: `pi_simulated_${crypto.randomBytes(16).toString('hex')}`,
        status: 'succeeded',
        amount: amount * 100,
      };
      logger.info(
        `Simulated payment intent for test payment method: ${JSON.stringify(paymentIntent)}`,
      );
    } else {
      const createPaymentIntentRequest = new PaymentIntentRequestDto(
        amount,
        wallet.currency,
        wallet.stripeCustomerId,
      );
      const createPaymentIntentResponse = await fetch(
        'http://localhost:3004/api/stripe/create-payment-intent',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPaymentIntentRequest),
        },
      );

      if (createPaymentIntentResponse.status !== 201)
        throw new Error('Payment intent creation failed');

      paymentIntent = (await createPaymentIntentResponse.json()).result;

      const confirmPaymentIntentResponse = await fetch(
        'http://localhost:3004/api/stripe/confirm-payment-intent',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            paymentMethodId,
          }),
        },
      );

      if (confirmPaymentIntentResponse.status !== 200)
        throw new Error('Payment intent confirmation failed');

      paymentIntent = (await confirmPaymentIntentResponse.json()).result;
    }

    if (paymentIntent.status === 'succeeded') {
      const depositAmount = paymentIntent.amount / 100;
      wallet.balance += depositAmount;
      await wallet.save();

      const transactionRequestDto = new TransactionRequestDto(
        'deposit',
        depositAmount,
        null,
        wallet._id.toString(),
        paymentIntent.id,
      );
      const transactionResponse = await fetch(
        'http://localhost:3003/api/transaction/create',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionRequestDto),
        },
      );
      if (transactionResponse.status !== 201) {
        logger.warn('Transaction creation on deposit failed');
      }

      return {
        balance: wallet.balance,
        transactionId: paymentIntent.id,
      };
    } else {
      throw new Error('Deposit failed');
    }
  }

  async withdraw(
    authHeader: string,
    userId: string,
    amount: number,
  ): Promise<PayoutResult> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    if (wallet.balance < amount) throw new Error('Insufficient funds');

    const createPayoutResponse = await fetch(
      'http://localhost:3004/api/stripe/create-payout',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          customerId: wallet.stripeCustomerId,
        }),
      },
    );

    if (createPayoutResponse.status !== 201) throw new Error('Payout creation failed');
    wallet.balance -= amount;
    await wallet.save();

    const payout = (await createPayoutResponse.json()).result;

    const transactionRequestDto = new TransactionRequestDto(
      'withdrawal',
      amount,
      wallet._id.toString(),
      null,
      payout.id,
    );
    const transactionResponse = await fetch(
      'http://localhost:3003/api/transaction/create',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionRequestDto),
      },
    );
    if (transactionResponse.status !== 201) {
      logger.warn('Transaction creation on withdraw failed');
    }

    return {
      balance: wallet.balance,
      payoutId: payout.id,
    };
  }

  async transfer(
    authHeader: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<TransferResult> {
    const fromWallet = await this.walletRepository.findByUserId(fromUserId);
    const toWallet = await this.walletRepository.findByUserId(toUserId);

    if (!fromWallet || !toWallet) throw new Error('One or both wallets do not exist.');

    fromWallet.balance -= amount;
    toWallet.balance += amount;

    await fromWallet.save();
    await toWallet.save();

    const transactionRequestDto = new TransactionRequestDto(
      'transfer',
      amount,
      fromWallet._id.toString(),
      toWallet._id.toString(),
      null,
    );
    const transactionResponse = await fetch(
      'http://localhost:3003/api/transaction/create',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionRequestDto),
      },
    );
    if (transactionResponse.status !== 201) {
      logger.warn('Transaction creation on withdraw failed');
    }

    return {
      fromBalance: fromWallet.balance,
      toBalance: toWallet.balance,
    };
  }

  async getTransactions(
    authHeader: string,
    userId: string,
  ): Promise<TransactionResult[]> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const transactionsResponse = await fetch(
      'http://localhost:3003/api/transaction/transactions/' + wallet._id.toString(),
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );
    if (transactionsResponse.status !== 200) {
      logger.warn('Transaction retrieval failed');
    }

    const transactions = (await transactionsResponse.json()).result;
    return transactions;
  }
}
