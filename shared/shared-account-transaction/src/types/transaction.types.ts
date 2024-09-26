export interface TransactionDetails {
  id: string;
  type: string;
  amount: number;
  fromWalletId: string | undefined;
  toWalletId: string | undefined;
  status: string;
}

export interface TransactionStatusDetails {
  id: string;
  status: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
