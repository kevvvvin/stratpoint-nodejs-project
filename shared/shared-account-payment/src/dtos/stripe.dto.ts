// TODO: USE COMPOSITION TO MAINTAIN DECOUPLING BETWEEN DTOS AND ALLOW REUSING COMMON PROPERTY
// COMMON PROPERTIES ENCOUNTERED SO FAR: PAYMENTMETHODID
import { CustomerResult, PaymentIntentDetails, PaymentMethodDetails } from '../types';

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

export class CustomerResponseDto {
  message: string;
  result: CustomerResult;

  constructor(message: string, result: CustomerResult) {
    this.message = message;
    this.result = result;
  }
}

export class PaymentMethodResponseDto {
  message: string;
  result: PaymentMethodDetails;

  constructor(message: string, result: PaymentMethodDetails) {
    this.message = message;
    this.result = result;
  }
}

export class PaymentMethodListResponseDto {
  message: string;
  result: PaymentMethodDetails[];

  constructor(message: string, result: PaymentMethodDetails[]) {
    this.message = message;
    this.result = result;
  }
}

export class PaymentIntentResponseDto {
  message: string;
  result: PaymentIntentDetails;

  constructor(message: string, result: PaymentIntentDetails) {
    this.message = message;
    this.result = result;
  }
}
