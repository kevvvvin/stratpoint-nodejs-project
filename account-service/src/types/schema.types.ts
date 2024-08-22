import { Types, Document } from 'mongoose';
import { cardDetails } from '../types';

export interface IWallet extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  balance: number;
  currency: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentMethod extends Document {
  user: Types.ObjectId;
  stripePaymentMethodId: string;
  type: string;
  card: cardDetails;
  isDefault: boolean;
  createdAt: Date;
}
