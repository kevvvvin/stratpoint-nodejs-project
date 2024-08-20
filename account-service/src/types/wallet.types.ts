import { IWallet } from './';

type WalletDetails = Pick<IWallet, '_id' | 'balance' | 'currency'>;

export interface WalletResult {
  wallet: WalletDetails;
}
