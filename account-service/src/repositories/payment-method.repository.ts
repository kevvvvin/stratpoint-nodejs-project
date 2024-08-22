import { Types } from 'mongoose';
import { PaymentMethod } from '../models';
import { IPaymentMethod, PaymentMethodDetails } from '../types';

export class PaymentMethodRepository {
  async findByUserId(userId: string): Promise<IPaymentMethod | null> {
    return await PaymentMethod.findOne({ user: new Types.ObjectId(userId) });
  }

  async findByPaymentMethodId(paymentMethodId: string): Promise<IPaymentMethod | null> {
    return await PaymentMethod.findOne({ stripePaymentMethodId: paymentMethodId });
  }

  async create(paymentMethodDetails: PaymentMethodDetails): Promise<IPaymentMethod> {
    const paymentMethod = new PaymentMethod(paymentMethodDetails);
    await paymentMethod.save();
    return paymentMethod;
  }
}
