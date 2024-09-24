import Stripe from 'stripe';
import { MockPayoutResult } from '../types';
import { JwtPayload } from 'shared-common';
import { logger } from '../utils';
import {
  CustomerResult,
  PaymentIntentDetails,
  PaymentMethodDetails,
} from 'shared-account-payment';

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

    return {
      id: customer.id,
    };
  }

  // async createPaymentMethod(
  //   paymentMethodDetails: CreatePaymentMethodRequestDto,
  // ): Promise<Stripe.PaymentMethod> {
  //   const paymentMethodData: Stripe.PaymentMethodCreateParams = {
  //     type: 'card',
  //     card: {
  //       token: paymentMethodDetails.token,
  //     },
  //   };
  //   return await this.stripe.paymentMethods.create(paymentMethodData);
  // }

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
  ): Promise<PaymentMethodDetails> {
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
    if (attachedMethod.type == undefined || attachedMethod.card == undefined) {
      throw new Error(
        'Expected a card and type in payment method retrieval response, but was undefined',
      );
    }

    return {
      id: attachedMethod.id,
      type: attachedMethod.type,
      card: {
        brand: attachedMethod.card.brand,
        last4: attachedMethod.card.last4,
        exp_month: attachedMethod.card.exp_month,
        exp_year: attachedMethod.card.exp_year,
      },
    };
  }

  async detachPaymentMethodFromCustomer(
    paymentMethodId: string,
  ): Promise<PaymentMethodDetails> {
    const detachedPaymentMethod =
      await this.stripe.paymentMethods.detach(paymentMethodId);

    if (
      detachedPaymentMethod.type == undefined ||
      detachedPaymentMethod.card == undefined
    ) {
      throw new Error('Expected a card and type in payment method detachment response');
    }

    return {
      id: detachedPaymentMethod.id,
      type: detachedPaymentMethod.type,
      card: {
        brand: detachedPaymentMethod.card.brand,
        last4: detachedPaymentMethod.card.last4,
        exp_month: detachedPaymentMethod.card.exp_month,
        exp_year: detachedPaymentMethod.card.exp_year,
      },
    };
  }

  async listCustomerPaymentMethods(customerId: string): Promise<PaymentMethodDetails[]> {
    const customerPaymentMethods = this.stripe.customers.listPaymentMethods(customerId, {
      type: 'card',
    });

    const paymentMethods: PaymentMethodDetails[] = (
      await customerPaymentMethods
    ).data.map((paymentMethod: Stripe.PaymentMethod) => {
      if (paymentMethod.type == undefined || paymentMethod.card == undefined) {
        throw new Error(
          'Expected a card and type in payment method retrieval response, but was undefined',
        );
      }
      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
        },
      };
    });

    return paymentMethods;
  }

  async retrievePaymentMethod(paymentMethodId: string): Promise<PaymentMethodDetails> {
    const retrieved = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (retrieved.type == undefined || retrieved.card == undefined) {
      throw new Error(
        'Expected a card and type in payment method retrieval response, but was undefined',
      );
    }

    return {
      id: retrieved.id,
      type: retrieved.type,
      card: {
        brand: retrieved.card.brand,
        last4: retrieved.card.last4,
        exp_month: retrieved.card.exp_month,
        exp_year: retrieved.card.exp_year,
      },
    };
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
  ): Promise<PaymentIntentDetails> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      customer: customerId,
      payment_method_types: ['card'],
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      paymentMethod: paymentIntent.payment_method_types,
    };
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<PaymentIntentDetails> {
    const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      paymentMethod: paymentIntent.payment_method_types,
    };
  }

  // TODO: test create payouts without mock
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
