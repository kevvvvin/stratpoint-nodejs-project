import { Types, Document } from 'mongoose';

export interface IWallet extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  balance: number;
  currency: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}
