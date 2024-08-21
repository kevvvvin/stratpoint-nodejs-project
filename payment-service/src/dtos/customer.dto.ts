import { CustomerResult } from '../types';

export class CustomerResponseDto {
  message: string;
  result: CustomerResult;

  constructor(message: string, result: CustomerResult) {
    this.message = message;
    this.result = result;
  }
}
