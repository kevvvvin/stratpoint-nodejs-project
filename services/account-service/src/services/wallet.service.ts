import {
  IPaymentMethod,
  STRIPE_TEST_PAYMENT_METHODS,
  ConfirmPaymentIntentResult,
  PayoutResult,
  TransferResult,
  WalletDetails,
  PaymentMethodResult,
} from '../types';
import { JwtPayload } from 'shared-common';
import { WalletRepository, PaymentMethodRepository } from '../repositories';
import { Types } from 'mongoose';
import { logger } from '../utils';
import { envConfig } from '../configs';
import { fetchHelper } from 'shared-common';
import {
  TransactionDetails,
  TransactionRequestDto,
  TransactionResponseDto,
  TransactionStatusDetails,
  TransactionStatusResponseDto,
} from 'shared-account-transaction';
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
import {
  AddPaymentMethodNotificationRequestDto,
  CreateWalletNotificationRequestDto,
  DepositNotificationRequestDto,
  TransferNotificationRequestDto,
  WithdrawNotificationRequestDto,
} from 'shared-notification';

export class WalletService {
  constructor(
    private walletRepository: WalletRepository,
    private paymentMethodRepository: PaymentMethodRepository,
  ) {}

  async create(userDetails: JwtPayload, authHeader: string): Promise<WalletDetails> {
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
        new CreateWalletNotificationRequestDto(newWallet.balance),
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send wallet creation notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

    return {
      _id: newWallet._id,
      user: newWallet.user,
      balance: newWallet.balance,
      currency: newWallet.currency,
      stripeCustomerId: newWallet.stripeCustomerId,
    };
  }

  async getWalletBalance(userId: string): Promise<WalletDetails> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    return {
      _id: wallet._id,
      user: wallet.user,
      balance: wallet.balance,
      currency: wallet.currency,
      stripeCustomerId: wallet.stripeCustomerId,
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
        expMonth: retrievedPaymentMethod.result.card.expMonth,
        expYear: retrievedPaymentMethod.result.card.expYear,
      },
      isDefault: false,
    });

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/add-payment-method-notification`,
        'POST',
        new AddPaymentMethodNotificationRequestDto(
          retrievedPaymentMethod.result.card.last4,
          retrievedPaymentMethod.result.card.brand,
        ),
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
      id: paymentMethod.stripePaymentMethodId,
      type: paymentMethod.type,
      card: {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.expMonth,
        expYear: paymentMethod.card.expYear,
      },
      isDefault: paymentMethod.isDefault,
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

  // TODO: refactor to create a transaction here with status 'pending'
  // TODO: refactor to use transaction ID instead of payment intent ID
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

  // TODO: refactor to update a transaction here to status 'completed'
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

      const transactionResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.transactionService}:3003/api/transaction/create`,
        'POST',
        new TransactionRequestDto(
          'deposit',
          amount,
          null,
          wallet._id.toString(),
          paymentIntent.result.id,
        ),
      );
      if (transactionResponse.status !== 201)
        throw new Error('Transaction creation on payment intent confirm failed');

      const transaction: TransactionResponseDto = await transactionResponse.json();
      if (Array.isArray(transaction.result))
        throw new Error(
          'Expected a single transaction on creation. Received a list of transactions.',
        );

      wallet.balance += amount;
      await wallet.save();

      return {
        id: transaction.result.id, // uses the transaction id from the transaction service
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

  // TODO: refactor to use transaction ID instead of paymentIntentId
  async getPaymentStatus(
    authHeader: string,
    paymentIntentId: string,
  ): Promise<TransactionStatusDetails> {
    const transactionResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.transactionService}:3003/api/transaction/status/${paymentIntentId}`,
      'GET',
    );
    if (transactionResponse.status !== 200)
      throw new Error('Payment status check failed');

    const transaction: TransactionStatusResponseDto = await transactionResponse.json();

    return transaction.result;
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

      const transactionResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.transactionService}:3003/api/transaction/create`,
        'POST',
        new TransactionRequestDto(
          'deposit',
          depositAmount,
          null,
          wallet._id.toString(),
          confirmedPaymentIntent.result.id,
        ),
      );
      if (transactionResponse.status !== 201)
        throw new Error('Transaction creation on deposit failed');

      const transaction: TransactionResponseDto = await transactionResponse.json();
      if (Array.isArray(transaction.result))
        throw new Error(
          'Expected a single transaction. Received a list of transactions.',
        );

      wallet.balance += depositAmount;
      await wallet.save();

      try {
        const notificationResponse = await fetchHelper(
          authHeader,
          `http://${envConfig.notificationService}:3006/api/notif/deposit-notification`,
          'POST',
          new DepositNotificationRequestDto(depositAmount, transaction.result.id),
        );

        if (notificationResponse.status !== 200) {
          logger.warn('Failed to send deposit notification');
        }
      } catch (err) {
        logger.warn('Failed to send request to notification service: ', err);
      }

      return {
        id: transaction.result.id,
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

    const transactionResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.transactionService}:3003/api/transaction/create`,
      'POST',
      new TransactionRequestDto(
        'withdrawal',
        amount,
        wallet._id.toString(),
        null,
        payout.result.id,
      ),
    );

    if (transactionResponse.status !== 201) {
      throw new Error('Transaction creation on withdraw failed');
    }

    const transaction: TransactionResponseDto = await transactionResponse.json();
    if (Array.isArray(transaction.result))
      throw new Error('Expected a single transaction. Received a list of transactions.');

    wallet.balance -= amount;
    await wallet.save();

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/withdraw-notification`,
        'POST',
        new WithdrawNotificationRequestDto(
          amount,
          wallet.balance,
          transaction.result.id,
          'completed',
          'bank_transfer',
        ),
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send withdrawal notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

    return {
      id: transaction.result.id,
      object: payout.result.object,
      amount: amount, // use payment intent amount / 100 to get amount in dollars
      currency: payout.result.currency,
      method: payout.result.method,
      status: payout.result.status,
      newBalance: wallet.balance,
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

    const transactionResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.transactionService}:3003/api/transaction/create`,
      'POST',
      new TransactionRequestDto(
        'transfer',
        amount,
        fromWallet._id.toString(),
        toWallet._id.toString(),
        null,
      ),
    );
    if (transactionResponse.status !== 201)
      throw new Error('Transaction creation on withdraw failed');

    const transaction: TransactionResponseDto = await transactionResponse.json();
    if (Array.isArray(transaction.result))
      throw new Error('Expected a single transaction. Received a list of transactions.');

    fromWallet.balance -= amount;
    toWallet.balance += amount;
    await fromWallet.save();
    await toWallet.save();

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/transfer-notification`,
        'POST',
        new TransferNotificationRequestDto(
          toUserId,
          amount,
          transaction.result.id,
          fromWallet.balance,
          toWallet.balance,
        ),
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
  ): Promise<TransactionDetails[]> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet does not exist.');

    const transactionsResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.transactionService}:3003/api/transaction/transactions/${wallet.id}`,
      'GET',
    );
    if (transactionsResponse.status !== 200)
      throw new Error('Transaction retrieval failed');

    const transactions: TransactionResponseDto = await transactionsResponse.json();

    if (!Array.isArray(transactions.result))
      throw new Error('Expected a list of transactions. Did not receive a list.');

    return transactions.result;
  }
}
