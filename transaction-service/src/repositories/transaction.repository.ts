import { Transaction } from '../models';
import { ITransaction } from '../types';
import { Types } from 'mongoose';

export class TransactionRepository {
  async getTransactionByPaymentId(paymentIntentId: string): Promise<ITransaction | null> {
    const transaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntentId,
    });
    return transaction;
  }
  async createTransaction(
    type: string,
    amount: number,
    fromWalletId: Types.ObjectId | null,
    toWalletId: Types.ObjectId | null,
    stripePaymentIntentId: string | null,
    status: string,
    metadata: object,
  ): Promise<ITransaction> {
    const transaction = new Transaction({
      type,
      amount,
      fromWallet: fromWalletId,
      toWallet: toWalletId,
      status,
      stripePaymentIntentId,
      metadata,
    });
    await transaction.save();
    return transaction;
  }
}
