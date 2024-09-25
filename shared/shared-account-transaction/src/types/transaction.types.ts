export interface TransactionDetails {
  id: string;
  type: string;
  amount: number;
  fromWalletId: string | undefined;
  toWalletId: string | undefined;
  status: string;
}
