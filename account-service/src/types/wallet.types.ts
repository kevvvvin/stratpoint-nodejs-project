import { IWallet } from './';

type WalletDetails = Pick<
  IWallet,
  '_id' | 'user' | 'balance' | 'currency' | 'stripeCustomerId'
>;

export interface WalletResult {
  wallet: WalletDetails;
}
