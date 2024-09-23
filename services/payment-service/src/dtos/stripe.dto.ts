import Stripe from 'stripe';
import { CustomerResult, MockPayoutResult } from '../types';

export class CustomerResponseDto {
  message: string;
  result: CustomerResult;

  constructor(message: string, result: CustomerResult) {
    this.message = message;
    this.result = result;
  }
}

export class PaymentMethodRequestDto {
  type: string;
  token: string;
  constructor(type: string, token: string) {
    this.type = type;
    this.token = token;
  }
}

export class PaymentIntentResponseDto {
  message: string;
  result: Stripe.PaymentIntent;

  constructor(message: string, result: Stripe.PaymentIntent) {
    this.message = message;
    this.result = result;
  }
}

export class PayoutResponseDto {
  message: string;
  result: Stripe.Payout | MockPayoutResult;

  constructor(message: string, result: Stripe.Payout | MockPayoutResult) {
    this.message = message;
    this.result = result;
  }
}
