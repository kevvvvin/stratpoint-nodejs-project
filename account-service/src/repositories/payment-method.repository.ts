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

  async findUserPaymentMethods(userId: string): Promise<IPaymentMethod[]> {
    return await PaymentMethod.find({ user: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });
  }

  async findUserPaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<IPaymentMethod | null> {
    return await PaymentMethod.findOne({
      user: new Types.ObjectId(userId),
      stripePaymentMethodId: paymentMethodId,
    });
  }

  async create(paymentMethodDetails: PaymentMethodDetails): Promise<IPaymentMethod> {
    const paymentMethod = new PaymentMethod(paymentMethodDetails);
    await paymentMethod.save();
    return paymentMethod;
  }

  async delete(paymentMethodId: Types.ObjectId): Promise<void> {
    await PaymentMethod.findByIdAndDelete(paymentMethodId);
  }
}
