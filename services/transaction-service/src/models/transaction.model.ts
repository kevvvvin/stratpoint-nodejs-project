import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '../types';

const transactionSchema = new Schema<ITransaction>({
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  fromWallet: {
    type: Schema.Types.ObjectId,
    required: function (this: ITransaction): boolean {
      return this.type === 'transfer' && this.status !== 'pending';
    },
  },
  toWallet: {
    type: Schema.Types.ObjectId,
    required: function (this: ITransaction): boolean {
      return this.type === 'transfer' || this.type === 'deposit';
    },
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  stripePaymentIntentId: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: (): Date => new Date(),
  },
  updatedAt: {
    type: Date,
    default: (): Date => new Date(),
  },
});

transactionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
