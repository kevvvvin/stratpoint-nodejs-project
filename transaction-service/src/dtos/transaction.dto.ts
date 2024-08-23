import { ITransaction } from '../types';

export class TransactionRequestDto {
  type: string;
  amount: number;
  fromWalletId: string | null;
  toWalletId: string | null;
  stripePaymentIntentId: string | null;
  status = 'completed';
  metadata = {};

  constructor(
    type: string,
    amount: number,
    fromWalletId: string | null,
    toWalletId: string | null,
    stripePaymentIntentId: string | null,
  ) {
    this.type = type;
    this.amount = amount;
    this.fromWalletId = fromWalletId;
    this.toWalletId = toWalletId;
    this.stripePaymentIntentId = stripePaymentIntentId;
  }
}

export class TransactionResponseDto {
  message: string;
  result: ITransaction | ITransaction[];

  constructor(message: string, result: ITransaction | ITransaction[]) {
    this.message = message;
    this.result = result;
  }
}
