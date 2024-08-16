import { IWallet } from './';

type WalletDetails = Pick<IWallet, '_id' | 'balance'>;

export interface WalletResult {
  wallet: WalletDetails;
}
