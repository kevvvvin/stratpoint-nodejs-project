import {
  ConfirmPaymentIntentResult,
  IPaymentMethod,
  PaymentMethodResult,
  PaymentStatusResult,
  PayoutResult,
  TransactionResult,
  TransferResult,
  WalletResult,
} from '../types';

export class WalletResponseDto {
  message: string;
  result: WalletResult;

  constructor(message: string, result: WalletResult) {
    this.message = message;
    this.result = result;
  }
}

export class PaymentMethodResponseDto {
  message: string;
  result: IPaymentMethod | PaymentMethodResult | IPaymentMethod[] | PaymentMethodResult[];

  constructor(
    message: string,
    result:
      | IPaymentMethod
      | PaymentMethodResult
      | IPaymentMethod[]
      | PaymentMethodResult[],
  ) {
    this.message = message;
    this.result = result;
  }
}

// ok
export class AddPaymentMethodRequestDto {
  paymentMethodId: string;

  constructor(paymentMethodId: string) {
    this.paymentMethodId = paymentMethodId;
  }
}

export class ConfirmPaymentIntentResponseDto {
  message: string;
  result: ConfirmPaymentIntentResult;

  constructor(message: string, result: ConfirmPaymentIntentResult) {
    this.message = message;
    this.result = result;
  }
}

// ok
export class DepositFundsRequestDto {
  amount: number;
  paymentMethodId: string;

  constructor(amount: number, paymentMethodId: string) {
    this.amount = amount;
    this.paymentMethodId = paymentMethodId;
  }
}

// ok
export class WithdrawFundsRequestDto {
  amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }
}

// ok
export class TransferFundsRequestDto {
  amount: number;
  toUserId: string;

  constructor(toUserId: string, amount: number) {
    this.toUserId = toUserId;
    this.amount = amount;
  }
}

// TODO: shared
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

export class PaymentStatusResponseDto {
  message: string;
  result: PaymentStatusResult;

  constructor(message: string, result: PaymentStatusResult) {
    this.message = message;
    this.result = result;
  }
}

export class PayoutResponseDto {
  message: string;
  result: PayoutResult;

  constructor(message: string, result: PayoutResult) {
    this.message = message;
    this.result = result;
  }
}

export class TransferResponseDto {
  message: string;
  result: TransferResult;

  constructor(message: string, result: TransferResult) {
    this.message = message;
    this.result = result;
  }
}

// TODO: shared
export class TransactionsResponseDto {
  message: string;
  result: TransactionResult[];

  constructor(message: string, result: TransactionResult[]) {
    this.message = message;
    this.result = result;
  }
}
