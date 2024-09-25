import { Types } from 'mongoose';
import { TransactionRepository } from '../repositories';
import { PaymentStatusResult } from '../types';
import { TransactionRequestDto, TransactionDetails } from 'shared-account-transaction';

export class TransactionService {
  constructor(private transactionRepository: TransactionRepository) {}

  async createTransaction(
    transactionDetails: TransactionRequestDto,
  ): Promise<TransactionDetails> {
    const type = transactionDetails.type;
    const amount = transactionDetails.amount;
    const fromWalletId =
      transactionDetails.fromWalletId != null
        ? new Types.ObjectId(transactionDetails.fromWalletId)
        : null;
    const toWalletId =
      transactionDetails.toWalletId != null
        ? new Types.ObjectId(transactionDetails.toWalletId)
        : null;
    const stripePaymentIntentId = transactionDetails.stripePaymentIntentId;
    const status = transactionDetails.status;
    const metadata = transactionDetails.metadata;

    const newTransaction = await this.transactionRepository.createTransaction(
      type,
      amount,
      fromWalletId,
      toWalletId,
      stripePaymentIntentId,
      status,
      metadata,
    );

    return {
      id: newTransaction._id.toString(),
      type: type,
      amount: amount,
      fromWalletId: fromWalletId?.toString(),
      toWalletId: toWalletId?.toString(),
      status: status,
    };
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResult> {
    const result =
      await this.transactionRepository.getTransactionByPaymentId(paymentIntentId);
    if (!result) throw new Error(`Transaction with ID ${paymentIntentId} not found`);

    return {
      stripePaymentIntentId: result.stripePaymentIntentId,
      status: result.status,
      amount: result.amount,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async getTransactions(walletId: string): Promise<TransactionDetails[]> {
    const retrievedTransactions =
      await this.transactionRepository.getUserTransactions(walletId);

    const transactions = retrievedTransactions.map((transaction) => {
      return {
        id: transaction._id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        fromWalletId: transaction.fromWallet?.toString(),
        toWalletId: transaction.toWallet?.toString(),
        status: transaction.status,
      };
    });

    return transactions;
  }
}
