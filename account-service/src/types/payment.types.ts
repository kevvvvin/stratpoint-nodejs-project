import { IPaymentMethod } from './';

export interface cardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export type PaymentMethodDetails = Pick<
  IPaymentMethod,
  'user' | 'stripePaymentMethodId' | 'type' | 'card' | 'isDefault'
>;

export interface PaymentMethodResult {
  paymentMethod: PaymentMethodDetails | PaymentMethodDetails[];
}

export const STRIPE_TEST_PAYMENT_METHODS = new Set([
  'pm_card_visa',
  'pm_card_mastercard',
  'pm_card_amex',
  'pm_card_discover',
  'pm_card_diners',
  'pm_card_jcb',
  'pm_card_unionpay',
  'pm_card_visa_debit',
  'pm_card_mastercard_prepaid',
  'pm_card_threeDSecure2Required',
  'pm_usBankAccount',
  'pm_sepaDebit',
  'pm_bacsDebit',
  'pm_alipay',
  'pm_wechat',
]);
