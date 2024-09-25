import { PaymentIntentDetails, PayoutDetails } from 'shared-account-payment';
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

export type ConfirmPaymentIntentResult = PaymentIntentDetails & { newBalance: number };

export interface PaymentStatusResult {
  stripePaymentIntentId: string;
  status: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PayoutResult = PayoutDetails & { balance: number };

export interface TransferResult {
  fromBalance: number;
  toBalance: number;
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
