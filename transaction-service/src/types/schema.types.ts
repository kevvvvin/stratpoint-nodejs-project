import { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
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
}
