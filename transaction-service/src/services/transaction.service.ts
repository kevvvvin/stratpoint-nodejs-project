import { Types } from 'mongoose';
import { TransactionRequestDto } from '../dtos';
import { TransactionRepository } from '../repositories';
import { ITransaction } from '../types';
import { PaymentStatusResult } from '../types/transaction.types';

export class TransactionService {
  constructor(private transactionRepository: TransactionRepository) {}

  async createTransaction(
    transactionDetails: TransactionRequestDto,
  ): Promise<ITransaction> {
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

    // if (stripePaymentIntentId) {
    //   const transaction =
    //     await this.transactionRepository.getTransactionByPaymentId(stripePaymentIntentId);
    //   if (transaction)
    //     throw new Error(`Transaction with ID ${stripePaymentIntentId} already exists`);
    // }

    const newTransaction = await this.transactionRepository.createTransaction(
      type,
      amount,
      fromWalletId,
      toWalletId,
      stripePaymentIntentId,
      status,
      metadata,
    );

    return newTransaction;
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

  async getTransactions(walletId: string): Promise<ITransaction[]> {
    const result = await this.transactionRepository.getUserTransactions(walletId);

    return result;
  }
}
