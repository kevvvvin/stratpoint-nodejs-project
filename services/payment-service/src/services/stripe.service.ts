import Stripe from 'stripe';
import { CustomerResult, MockPayoutResult } from '../types';
import { JwtPayload } from 'shared-common';
import { PaymentMethodRequestDto } from '../dtos';
import { logger } from '../utils';

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
    const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer === customerId)
      throw new Error('Payment method already attached to customer');

    if (paymentMethod.customer) {
      await this.stripe.paymentMethods.detach(paymentMethodId);
      logger.info(`Detached payment method ${paymentMethodId} from previous customer`);
    }

    const attachedMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    return attachedMethod;
  }

  async detachPaymentMethodFromCustomer(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    const detachedPaymentMethod = this.stripe.paymentMethods.detach(paymentMethodId);
    return detachedPaymentMethod;
  }

  async listCustomerPaymentMethods(
    customerId: string,
  ): Promise<Stripe.Response<Stripe.ApiList<Stripe.PaymentMethod>>> {
    const paymentMethods = this.stripe.customers.listPaymentMethods(customerId, {
      type: 'card',
    });

    return paymentMethods;
  }

  async retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.retrieve(paymentMethodId);
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      customer: customerId,
      payment_method_types: ['card'],
    });
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  async createPayout(amount: number, customerId: string): Promise<MockPayoutResult> {
    // const payout = await this.stripe.payouts.create(
    //   {
    //     amount: amount * 100,
    //     currency: 'usd',
    //     method: 'instant',
    //   },
    //   {
    //     stripeAccount: customerId,
    //   },
    // );
    const mockPayout = {
      id: `po_${Math.random().toString(36).substring(7)}`,
      object: 'payout',
      amount: amount * 100,
      currency: 'usd',
      method: 'instant',
      status: 'completed',
    };
    logger.info(
      `Created payout for customer ${customerId}: ${JSON.stringify(mockPayout)}`,
    );
    return mockPayout;
  }
}
