import {
  ConfirmPaymentIntentResult,
  CreatePaymentIntentResult,
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

export class PaymentMethodRequestDto {
  paymentMethodId: string;

  constructor(paymentMethodId: string) {
    this.paymentMethodId = paymentMethodId;
  }
}

// TODO: shared
export class PaymentIntentRequestDto {
  amount: number;
  currency: string;
  stripeCustomerId: string;

  constructor(amount: number, currency: string, stripeCustomerId: string) {
    this.amount = amount;
    this.currency = currency;
    this.stripeCustomerId = stripeCustomerId;
  }
}

export class CreatePaymentIntentResponseDto {
  message: string;
  result: CreatePaymentIntentResult;

  constructor(message: string, result: CreatePaymentIntentResult) {
    this.message = message;
    this.result = result;
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

export class TransactionsResponseDto {
  message: string;
  result: TransactionResult[];

  constructor(message: string, result: TransactionResult[]) {
    this.message = message;
    this.result = result;
  }
}
