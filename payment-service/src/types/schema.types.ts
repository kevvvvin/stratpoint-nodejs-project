import { Types, Document } from 'mongoose';
import { cardDetails } from './';

export interface IPaymentMethod extends Document {
  user: Types.ObjectId;
  stripePaymentMethodId: string;
  type: string;
  card: cardDetails;
  isDefault: boolean;
  createdAt: Date;
}
