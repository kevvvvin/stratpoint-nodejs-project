// TODO: USE COMPOSITION TO MAINTAIN DECOUPLING BETWEEN DTOS AND ALLOW REUSING COMMON PROPERTY
// COMMON PROPERTIES ENCOUNTERED SO FAR: PAYMENTMETHODID
import type { Stripe } from 'stripe';

export class RetrievePaymentMethodRequestDto {
  paymentMethodId: string;

  constructor(paymentMethodId: string) {
    this.paymentMethodId = paymentMethodId;
  }
}

export class AttachPaymentMethodRequestDto {
  paymentMethodId: string;
  customerId: string;

  constructor(paymentMethodId: string, customerId: string) {
    this.paymentMethodId = paymentMethodId;
    this.customerId = customerId;
  }
}

export class DetachPaymentMethodRequestDto {
  paymentMethodId: string;
  constructor(paymentMethodId: string) {
    this.paymentMethodId = paymentMethodId;
  }
}

export class CreatePaymentIntentRequestDto {
  amount: number;
  currency: string;
  stripeCustomerId: string;

  constructor(amount: number, currency: string, stripeCustomerId: string) {
    this.amount = amount;
    this.currency = currency;
    this.stripeCustomerId = stripeCustomerId;
  }
}

export class ConfirmPaymentIntentRequestDto {
  paymentMethodId: string;
  paymentIntentId: string;

  constructor(paymentIntentId: string, paymentMethodId: string) {
    this.paymentIntentId = paymentIntentId;
    this.paymentMethodId = paymentMethodId;
  }
}

export class CreatePayoutRequestDto {
  amount: number;
  customerId: string;

  constructor(amount: number, customerId: string) {
    this.amount = amount;
    this.customerId = customerId;
  }
}

export class PaymentMethodResponseDto {
  message: string;
  result: Stripe.PaymentMethod | Stripe.ApiList<Stripe.PaymentMethod>;

  constructor(
    message: string,
    result: Stripe.PaymentMethod | Stripe.ApiList<Stripe.PaymentMethod>,
  ) {
    this.message = message;
    this.result = result;
  }
}
