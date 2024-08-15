import { KycIdEnum } from '../enums';
import { KycResult } from '../types';

export class KycResponseDto {
  message: string;
  result: KycResult | KycResult[];

  constructor(message: string, result: KycResult | KycResult[]) {
    this.message = message;
    this.result = result;
  }
}

export class KycSubmitRequestDto {
  idType: KycIdEnum;
  idNumber: string;
  idExpiration: string;
  // idExpiration: Date;

  constructor(idType: KycIdEnum, idNumber: string, idExpiration: string) {
    this.idType = idType;
    this.idNumber = idNumber;
    this.idExpiration = idExpiration;
  }
}
