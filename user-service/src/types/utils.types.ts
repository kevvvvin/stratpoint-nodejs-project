import { KycUserStatusEnum, StatusEnum } from '../enums';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  status: StatusEnum;
  kycStatus: KycUserStatusEnum;
  exp: number;
}
