import { IPaymentMethod, PaymentMethodResult, WalletResult } from '../types';

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
