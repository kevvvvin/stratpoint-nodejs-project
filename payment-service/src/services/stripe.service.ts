import Stripe from 'stripe';
import { JwtPayload, CustomerResult } from '../types';
import { PaymentMethodRequestDto } from '../dtos';

export class StripeService {
  constructor(private stripe: Stripe) {}

  async createCustomer(userDetails: JwtPayload): Promise<CustomerResult> {
    const existingUser = await this.stripe.customers.list({
      email: userDetails.email,
      limit: 1,
    });
    if (existingUser.data.length > 0)
      throw new Error('Customer creation failed. Customer already exists.');

    const customer = await this.stripe.customers.create({ email: userDetails.email });
    const createResult: CustomerResult = {
      id: customer.id,
    };

    return createResult;
  }

  async createPaymentMethod(
    paymentMethodDetails: PaymentMethodRequestDto,
  ): Promise<Stripe.PaymentMethod> {
    const paymentMethodData: Stripe.PaymentMethodCreateParams = {
      type: 'card',
      card: {
        token: paymentMethodDetails.token,
      },
    };
    return await this.stripe.paymentMethods.create(paymentMethodData);
  }

  async getCustomerId(email: string): Promise<string> {
    const customer = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });
    return customer.data[0].id;
  }

  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async listCustomerPaymentMethods(
    customerId: string,
  ): Promise<Stripe.Response<Stripe.ApiList<Stripe.PaymentMethod>>> {
    const paymentMethods = this.stripe.customers.listPaymentMethods(customerId, {
      type: 'card',
    });

    return paymentMethods;
  }
}
