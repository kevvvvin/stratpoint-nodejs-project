import mongoose, { Schema } from 'mongoose';
import { IWallet } from '../types';

const walletSchema = new Schema<IWallet>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  stripeCustomerId: {
    type: String,
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

walletSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Wallet = mongoose.model('Wallet', walletSchema);
