import { ITransaction } from './';

export type PaymentStatusResult = Pick<
  ITransaction,
  'stripePaymentIntentId' | 'status' | 'amount' | 'createdAt' | 'updatedAt'
>;
