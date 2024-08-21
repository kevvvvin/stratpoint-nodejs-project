import Stripe from 'stripe';
import { JwtPayload, CustomerResult } from '../types';

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
}
