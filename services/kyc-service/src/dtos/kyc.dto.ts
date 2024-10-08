import { KycIdEnum } from '../enums';
import { IKyc, KycResult } from '../types';

export class KycResponseDto {
  message: string;
  result: KycResult | IKyc | KycResult[] | IKyc[];

  constructor(message: string, result: KycResult | IKyc | KycResult[] | IKyc[]) {
    this.message = message;
    this.result = result;
  }
}

export class KycSubmitRequestDto implements Pick<IKyc, 'idType' | 'idNumber'> {
  idType: KycIdEnum;
  idNumber: string;
  idExpiration: string | Date;

  constructor(idType: KycIdEnum, idNumber: string, idExpiration: string | Date) {
    this.idType = idType;
    this.idNumber = idNumber;
    this.idExpiration = idExpiration;
  }
}
