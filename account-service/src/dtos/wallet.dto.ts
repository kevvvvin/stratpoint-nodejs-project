import { WalletResult } from '../types';

export class WalletResponseDto {
  message: string;
  result: WalletResult;

  constructor(message: string, result: WalletResult) {
    this.message = message;
    this.result = result;
  }
}
