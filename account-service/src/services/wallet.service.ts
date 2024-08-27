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
import { logger, fetchHelper } from '../utils';
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

    const customerResponse = await fetchHelper(
      authHeader,
      'http://localhost:3004/api/stripe/create-customer-id',
      'POST',
      null,
    );
    if (customerResponse.status !== 201)
      throw new Error('Wallet creation failed. Customer creation failed.');

    const customer = (await customerResponse.json()).result;
    const newWallet = await this.walletRepository.create(
      userDetails.sub,
      customer.id as string,
    );

    return {
      wallet: {
        _id: newWallet._id,
        user: newWallet.user,
        balance: newWallet.balance,
        currency: newWallet.currency,
        stripeCustomerId: newWallet.stripeCustomerId,
      },
    };
  }

  async getWalletBalance(userId: string): Promise<WalletResult> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    return {
      wallet: {
        _id: wallet._id,
        user: wallet.user,
        balance: wallet.balance,
        currency: wallet.currency,
        stripeCustomerId: wallet.stripeCustomerId,
      },
    };
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

    const retrieveResponse = await fetchHelper(
      authHeader,
      'http://localhost:3004/api/stripe/retrieve-payment-method',
      'POST',
      { paymentMethodId },
    );
    if (retrieveResponse.status !== 200)
      throw new Error('Payment method retrieval failed.');

    const retrievedPaymentMethod = (await retrieveResponse.json()).result;

    const attachResponse = await fetchHelper(
      authHeader,
      'http://localhost:3004/api/stripe/attach-payment-method',
      'POST',
      { paymentMethodId, customerId: wallet.stripeCustomerId },
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

    const detachResponse = await fetchHelper(
      authHeader,
      'http://localhost:3004/api/stripe/detach-payment-method',
      'POST',
      { paymentMethodId },
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

    const paymentIntentResponse = await fetchHelper(
      authHeader,
      'http://localhost:3004/api/stripe/create-payment-intent',
      'POST',
      paymentIntentRequest,
    );
    if (paymentIntentResponse.status !== 201)
      throw new Error('Payment intent creation failed');

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
      const paymentIntentResponse = await fetchHelper(
        authHeader,
        'http://localhost:3004/api/stripe/confirm-payment-intent',
        'POST',
        { paymentIntentId, paymentMethodId },
      );
      if (paymentIntentResponse.status !== 200)
        throw new Error('Payment intent confirmation failed');

      paymentIntent = (await paymentIntentResponse.json()).result;
    }

    if (paymentIntent.status === 'succeeded') {
      const amount = paymentIntent.amount / 100;

      const transactionRequestDto = new TransactionRequestDto(
        'deposit',
        amount,
        null,
        wallet._id.toString(),
        paymentIntent.id,
      );
      const transactionResponse = await fetchHelper(
        authHeader,
        'http://localhost:3003/api/transaction/create',
        'POST',
        transactionRequestDto,
      );
      if (transactionResponse.status !== 201)
        throw new Error('Transaction creation on payment intent confirm failed');

      wallet.balance += amount;
      await wallet.save();

      return { balance: wallet.balance, transactionId: paymentIntent.id };
    } else {
      throw new Error('Payment failed');
    }
  }

  async getPaymentStatus(
    authHeader: string,
    paymentIntentId: string,
  ): Promise<PaymentStatusResult> {
    const transactionResponse = await fetchHelper(
      authHeader,
      'http://localhost:3003/api/transaction/status/' + paymentIntentId,
      'GET',
      null,
    );
    if (transactionResponse.status !== 200)
      throw new Error('Payment status check failed');

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
      const createPaymentIntentResponse = await fetchHelper(
        authHeader,
        'http://localhost:3004/api/stripe/create-payment-intent',
        'POST',
        createPaymentIntentRequest,
      );
      if (createPaymentIntentResponse.status !== 201)
        throw new Error('Payment intent creation failed');

      paymentIntent = (await createPaymentIntentResponse.json()).result;

      const confirmPaymentIntentRequest = {
        paymentIntentId: paymentIntent.id,
        paymentMethodId,
      };
      const confirmPaymentIntentResponse = await fetchHelper(
        authHeader,
        'http://localhost:3004/api/stripe/confirm-payment-intent',
        'POST',
        confirmPaymentIntentRequest,
      );
      if (confirmPaymentIntentResponse.status !== 200)
        throw new Error('Payment intent confirmation failed');

      paymentIntent = (await confirmPaymentIntentResponse.json()).result;
    }

    if (paymentIntent.status === 'succeeded') {
      const depositAmount = paymentIntent.amount / 100;

      const transactionRequestDto = new TransactionRequestDto(
        'deposit',
        depositAmount,
        null,
        wallet._id.toString(),
        paymentIntent.id,
      );
      const transactionResponse = await fetchHelper(
        authHeader,
        'http://localhost:3003/api/transaction/create',
        'POST',
        transactionRequestDto,
      );
      if (transactionResponse.status !== 201) {
        throw new Error('Transaction creation on deposit failed');
      }

      wallet.balance += depositAmount;
      await wallet.save();

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
    if (wallet.balance < amount) throw new Error('Insufficient funds. Withdrawal failed');

    const createPayoutRequest = {
      amount: amount,
      customerId: wallet.stripeCustomerId,
    };
    const createPayoutResponse = await fetchHelper(
      authHeader,
      'http://localhost:3004/api/stripe/create-payout',
      'POST',
      createPayoutRequest,
    );
    if (createPayoutResponse.status !== 201) throw new Error('Payout creation failed');

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
      throw new Error('Transaction creation on withdraw failed');
    }

    wallet.balance -= amount;
    await wallet.save();

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

    const transactionRequestDto = new TransactionRequestDto(
      'transfer',
      amount,
      fromWallet._id.toString(),
      toWallet._id.toString(),
      null,
    );
    const transactionResponse = await fetchHelper(
      authHeader,
      'http://localhost:3003/api/transaction/create',
      'POST',
      transactionRequestDto,
    );
    if (transactionResponse.status !== 201)
      throw new Error('Transaction creation on withdraw failed');

    fromWallet.balance -= amount;
    toWallet.balance += amount;
    await fromWallet.save();
    await toWallet.save();

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

    const transactionsResponse = await fetchHelper(
      authHeader,
      'http://localhost:3003/api/transaction/transactions/' + wallet._id.toString(),
      'GET',
      null,
    );
    if (transactionsResponse.status !== 200)
      throw new Error('Transaction retrieval failed');

    const transactions = (await transactionsResponse.json()).result;
    return transactions;
  }
}
