import Stripe from 'stripe';

export class PaymentMethodResponseDto {
  message: string;
  result: Stripe.PaymentMethod | Stripe.PaymentMethod[];

  constructor(message: string, result: Stripe.PaymentMethod | Stripe.PaymentMethod[]) {
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
