import { IPaymentMethod, WalletResult } from '../types';

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
  result: IPaymentMethod;

  constructor(message: string, result: IPaymentMethod) {
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
