import { Types } from 'mongoose';
import { TransactionRequestDto } from '../dtos';
import { TransactionRepository } from '../repositories';
import { ITransaction } from '../types';

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

    const transaction = await this.transactionRepository.createTransaction(
      type,
      amount,
      fromWalletId,
      toWalletId,
      stripePaymentIntentId,
      status,
      metadata,
    );

    return transaction;
  }
}
