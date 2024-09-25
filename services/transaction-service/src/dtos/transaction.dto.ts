import { PaymentStatusResult } from '../types/transaction.types';

export class PaymentStatusResponseDto {
  message: string;
  result: PaymentStatusResult;

  constructor(message: string, result: PaymentStatusResult) {
    this.message = message;
    this.result = result;
  }
}
