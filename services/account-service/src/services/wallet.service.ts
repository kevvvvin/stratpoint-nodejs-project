import {
  IPaymentMethod,
  PaymentMethodResult,
  WalletResult,
  STRIPE_TEST_PAYMENT_METHODS,
  ConfirmPaymentIntentResult,
  PaymentStatusResult,
  PayoutResult,
  TransferResult,
  TransactionResult,
} from '../types';
import { JwtPayload } from 'shared-common';
import { WalletRepository, PaymentMethodRepository } from '../repositories';
import { Types } from 'mongoose';
import { logger } from '../utils';
import { TransactionRequestDto } from '../dtos';
import { envConfig } from '../configs';
import { fetchHelper } from 'shared-common';
import {
  AttachPaymentMethodRequestDto,
  ConfirmPaymentIntentRequestDto,
  CreatePaymentIntentRequestDto,
  CreatePayoutRequestDto,
  CustomerResponseDto,
  DetachPaymentMethodRequestDto,
  PaymentIntentDetails,
  PaymentIntentResponseDto,
  PaymentMethodResponseDto,
  PayoutResponseDto,
  RetrievePaymentMethodRequestDto,
} from 'shared-account-payment';

export class WalletService {
  constructor(
    private walletRepository: WalletRepository,
    private paymentMethodRepository: PaymentMethodRepository,
  ) {}

  async create(userDetails: JwtPayload, authHeader: string): Promise<WalletResult> {
    const wallet = await this.walletRepository.findByUserId(userDetails.sub);
    if (wallet) throw new Error('Wallet creation failed. Wallet already exists.');

    const fetchCreateCustomer = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/create-customer-id`,
      'POST',
    );
    if (fetchCreateCustomer.status !== 201)
      throw new Error('Wallet creation failed. Customer creation failed.');

    const customerResponse: CustomerResponseDto = await fetchCreateCustomer.json();
    const newWallet = await this.walletRepository.create(
      userDetails.sub,
      customerResponse.result.id,
    );

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/wallet-creation-notification`,
        'POST',
        { initialBalance: newWallet.balance },
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send wallet creation notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

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

    const fetchRetrievePM = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/retrieve-payment-method`,
      'POST',
      new RetrievePaymentMethodRequestDto(paymentMethodId),
    );
    if (fetchRetrievePM.status !== 200)
      throw new Error('Payment method retrieval failed.');

    const retrievedPaymentMethod: PaymentMethodResponseDto = await fetchRetrievePM.json();

    const attachResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/attach-payment-method`,
      'POST',
      new AttachPaymentMethodRequestDto(paymentMethodId, wallet.stripeCustomerId),
    );
    if (attachResponse.status !== 200)
      throw new Error('Payment method attachment to customer failed');

    const newPaymentMethod = this.paymentMethodRepository.create({
      user: new Types.ObjectId(userId),
      stripePaymentMethodId: paymentMethodId,
      type: retrievedPaymentMethod.result.type,
      card: {
        brand: retrievedPaymentMethod.result.card.brand,
        last4: retrievedPaymentMethod.result.card.last4,
        expMonth: retrievedPaymentMethod.result.card.exp_month,
        expYear: retrievedPaymentMethod.result.card.exp_year,
      },
      isDefault: false,
    });

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/add-payment-method-notification`,
        'POST',
        {
          last4: retrievedPaymentMethod.result.card.last4,
          cardBrand: retrievedPaymentMethod.result.card.brand,
        },
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send added payment method notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

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

    const fetchDetach = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/detach-payment-method`,
      'POST',
      new DetachPaymentMethodRequestDto(paymentMethodId),
    );
    if (fetchDetach.status !== 200) {
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
  ): Promise<PaymentIntentDetails> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const paymentIntentResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/create-payment-intent`,
      'POST',
      new CreatePaymentIntentRequestDto(amount, wallet.currency, wallet.stripeCustomerId),
    );
    if (paymentIntentResponse.status !== 201)
      throw new Error('Payment intent creation failed');

    const paymentIntent: PaymentIntentResponseDto = await paymentIntentResponse.json();

    return {
      id: paymentIntent.result.id,
      amount: amount,
      currency: paymentIntent.result.currency,
      status: paymentIntent.result.status,
      clientSecret: paymentIntent.result.clientSecret,
      paymentMethod: paymentIntent.result.paymentMethod,
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

    const paymentIntentResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/confirm-payment-intent`,
      'POST',
      new ConfirmPaymentIntentRequestDto(paymentIntentId, paymentMethodId),
    );
    if (paymentIntentResponse.status !== 200)
      throw new Error('Payment intent confirmation failed');

    const paymentIntent: PaymentIntentResponseDto = await paymentIntentResponse.json();

    if (paymentIntent.result.status === 'succeeded') {
      const amount = paymentIntent.result.amount / 100;

      const transactionRequestDto = new TransactionRequestDto(
        'deposit',
        amount,
        null,
        wallet._id.toString(),
        paymentIntent.result.id,
      );
      const transactionResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.transactionService}:3003/api/transaction/create`,
        'POST',
        transactionRequestDto,
      );
      if (transactionResponse.status !== 201)
        throw new Error('Transaction creation on payment intent confirm failed');

      const transactionId = (await transactionResponse.json()).result._id;

      wallet.balance += amount;
      await wallet.save();

      return {
        id: transactionId, // this is equal to the payment intent's id
        amount: amount, // use payment intent amount / 100 to get amount in dollars
        currency: paymentIntent.result.currency,
        status: paymentIntent.result.status,
        clientSecret: paymentIntent.result.clientSecret,
        paymentMethod: paymentIntent.result.paymentMethod,
        newBalance: wallet.balance,
      };
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
      `http://${envConfig.transactionService}:3003/api/transaction/status/${paymentIntentId}`,
      'GET',
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

    const createPaymentIntentResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/create-payment-intent`,
      'POST',
      new CreatePaymentIntentRequestDto(amount, wallet.currency, wallet.stripeCustomerId),
    );
    if (createPaymentIntentResponse.status !== 201)
      throw new Error('Payment intent creation failed');

    const createdPaymentIntent: PaymentIntentResponseDto =
      await createPaymentIntentResponse.json();

    const confirmPaymentIntentResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/confirm-payment-intent`,
      'POST',
      new ConfirmPaymentIntentRequestDto(createdPaymentIntent.result.id, paymentMethodId),
    );
    if (confirmPaymentIntentResponse.status !== 200)
      throw new Error('Payment intent confirmation failed');

    const confirmedPaymentIntent: PaymentIntentResponseDto =
      await confirmPaymentIntentResponse.json();

    if (confirmedPaymentIntent.result.status === 'succeeded') {
      const depositAmount = confirmedPaymentIntent.result.amount / 100;

      const transactionRequestDto = new TransactionRequestDto(
        'deposit',
        depositAmount,
        null,
        wallet._id.toString(),
        confirmedPaymentIntent.result.id,
      );
      const transactionResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.transactionService}:3003/api/transaction/create`,
        'POST',
        transactionRequestDto,
      );
      if (transactionResponse.status !== 201)
        throw new Error('Transaction creation on deposit failed');

      const transactionId = (await transactionResponse.json()).result._id;

      wallet.balance += depositAmount;
      await wallet.save();

      try {
        const notificationResponse = await fetchHelper(
          authHeader,
          `http://${envConfig.notificationService}:3006/api/notif/deposit-notification`,
          'POST',
          { amount: depositAmount, transactionId: transactionId },
        );

        if (notificationResponse.status !== 200) {
          logger.warn('Failed to send deposit notification');
        }
      } catch (err) {
        logger.warn('Failed to send request to notification service: ', err);
      }

      return {
        id: transactionId, // this is equal to the payment intent's id
        amount: depositAmount, // use payment intent amount / 100 to get amount in dollars,
        currency: confirmedPaymentIntent.result.currency,
        status: confirmedPaymentIntent.result.status,
        clientSecret: confirmedPaymentIntent.result.clientSecret,
        paymentMethod: confirmedPaymentIntent.result.paymentMethod,
        newBalance: wallet.balance,
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

    const createPayoutResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.paymentService}:3004/api/stripe/create-payout`,
      'POST',
      new CreatePayoutRequestDto(amount, wallet.stripeCustomerId),
    );
    if (createPayoutResponse.status !== 201) throw new Error('Payout creation failed');

    const payout: PayoutResponseDto = await createPayoutResponse.json();

    const transactionRequestDto = new TransactionRequestDto(
      'withdrawal',
      amount,
      wallet._id.toString(),
      null,
      payout.result.id,
    );
    const transactionResponse = await fetch(
      `http://${envConfig.transactionService}:3003/api/transaction/create`,
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

    const transactionId = (await transactionResponse.json()).result._id;

    wallet.balance -= amount;
    await wallet.save();

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/withdraw-notification`,
        'POST',
        {
          amount: amount,
          newBalance: wallet.balance,
          transactionId: transactionId,
          withdrawalStatus: 'completed',
          withdrawalMethod: 'bank_transfer',
        },
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send withdrawal notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

    return {
      id: payout.result.id,
      object: payout.result.object,
      amount: payout.result.amount,
      currency: payout.result.currency,
      method: payout.result.method,
      status: payout.result.status,
      balance: wallet.balance,
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
      `http://${envConfig.transactionService}:3003/api/transaction/create`,
      'POST',
      transactionRequestDto,
    );
    if (transactionResponse.status !== 201)
      throw new Error('Transaction creation on withdraw failed');

    const transactionId = (await transactionResponse.json()).result._id;

    fromWallet.balance -= amount;
    toWallet.balance += amount;
    await fromWallet.save();
    await toWallet.save();

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/transfer-notification`,
        'POST',
        {
          toUserId: toUserId,
          amount: amount,
          transactionId: transactionId,
          fromBalance: fromWallet.balance,
          toBalance: toWallet.balance,
        },
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send deposit notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
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

    const transactionsResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.transactionService}:3003/api/transaction/transactions/${wallet._id.toString()}`,
      'GET',
    );
    if (transactionsResponse.status !== 200)
      throw new Error('Transaction retrieval failed');

    const transactions = (await transactionsResponse.json()).result;
    return transactions;
  }
}
