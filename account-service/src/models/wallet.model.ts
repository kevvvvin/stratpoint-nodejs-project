import mongoose, { Schema } from 'mongoose';
import { IWallet } from '../types';

const walletSchema = new Schema<IWallet>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  stripeCustomerId: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

walletSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Wallet = mongoose.model('Wallet', walletSchema);
