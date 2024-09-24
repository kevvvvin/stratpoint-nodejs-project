import Stripe from 'stripe';
import { MockPayoutResult } from '../types';

// export class CreatePaymentMethodRequestDto {
//   type: string;
//   token: string;
//   constructor(type: string, token: string) {
//     this.type = type;
//     this.token = token;
//   }
// }

export class PayoutResponseDto {
  message: string;
  result: Stripe.Payout | MockPayoutResult;

  constructor(message: string, result: Stripe.Payout | MockPayoutResult) {
    this.message = message;
    this.result = result;
  }
}
