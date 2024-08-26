import { Schema } from 'mongoose';
import { IWallet } from './';

type WalletDetails = Pick<
  IWallet,
  '_id' | 'user' | 'balance' | 'currency' | 'stripeCustomerId'
>;

export interface WalletResult {
  wallet: WalletDetails;
}

export interface TransactionResult {
  _id: Schema.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  fromWallet?: Schema.Types.ObjectId;
  toWallet?: Schema.Types.ObjectId;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  metadata?: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}
