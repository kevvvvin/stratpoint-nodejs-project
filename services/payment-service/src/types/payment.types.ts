import { IPaymentMethod } from './';

export interface cardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export type PaymentMethodDetails = Pick<
  IPaymentMethod,
  'stripePaymentMethodId' | 'type' | 'card' | 'isDefault'
>;

export interface PaymentMethodResult {
  paymentMethod: PaymentMethodDetails | PaymentMethodDetails[];
}

export interface MockPayoutResult {
  id: string;
  object: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
}
