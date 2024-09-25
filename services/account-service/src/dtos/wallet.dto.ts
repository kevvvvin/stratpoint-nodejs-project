import {
  ConfirmPaymentIntentResult,
  IPaymentMethod,
  PaymentMethodResult,
  PaymentStatusResult,
  PayoutResult,
  TransferResult,
  WalletDetails,
} from '../types';

// REQUEST DTOs

export class AddPaymentMethodRequestDto {
  paymentMethodId: string;

  constructor(paymentMethodId: string) {
    this.paymentMethodId = paymentMethodId;
  }
}

export class DepositFundsRequestDto {
  amount: number;
  paymentMethodId: string;

  constructor(amount: number, paymentMethodId: string) {
    this.amount = amount;
    this.paymentMethodId = paymentMethodId;
  }
}

export class WithdrawFundsRequestDto {
  amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }
}

export class TransferFundsRequestDto {
  amount: number;
  toUserId: string;

  constructor(toUserId: string, amount: number) {
    this.toUserId = toUserId;
    this.amount = amount;
  }
}

// RESPONSE DTOs

export class WalletResponseDto {
  message: string;
  result: WalletDetails;

  constructor(message: string, result: WalletDetails) {
    this.message = message;
    this.result = result;
  }
}

export class PaymentMethodResponseDto {
  message: string;
  result: IPaymentMethod | PaymentMethodResult | PaymentMethodResult[];

  constructor(
    message: string,
    result: IPaymentMethod | PaymentMethodResult | PaymentMethodResult[],
  ) {
    this.message = message;
    this.result = result;
  }
}

export class DepositFundsResponseDto {
  message: string;
  result: ConfirmPaymentIntentResult;

  constructor(message: string, result: ConfirmPaymentIntentResult) {
    this.message = message;
    this.result = result;
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

export class WithdrawFundsResponseDto {
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
