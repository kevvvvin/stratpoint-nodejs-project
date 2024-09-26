import { Types } from 'mongoose';
import { TransactionRepository } from '../repositories';
import {
  TransactionRequestDto,
  TransactionDetails,
  TransactionStatusDetails,
} from 'shared-account-transaction';

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
      id: newTransaction.id,
      type: type,
      amount: amount,
      fromWalletId: fromWalletId?.toString(),
      toWalletId: toWalletId?.toString(),
      status: status,
    };
  }

  async getPaymentStatus(paymentIntentId: string): Promise<TransactionStatusDetails> {
    const transaction =
      await this.transactionRepository.getTransactionByPaymentId(paymentIntentId);
    if (!transaction) throw new Error(`Transaction with ID ${paymentIntentId} not found`);

    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async getTransactions(walletId: string): Promise<TransactionDetails[]> {
    const retrievedTransactions =
      await this.transactionRepository.getUserTransactions(walletId);

    const transactions = retrievedTransactions.map((transaction) => {
      return {
        id: transaction.id,
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
