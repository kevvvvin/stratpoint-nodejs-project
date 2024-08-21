import { Types, Document } from 'mongoose';

export interface IPaymentMethod extends Document {
  _id: Types.ObjectId;
}
