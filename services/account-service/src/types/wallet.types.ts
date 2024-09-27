import { IWallet } from './';

export type WalletDetails = Pick<
  IWallet,
  '_id' | 'user' | 'balance' | 'currency' | 'stripeCustomerId'
>;
