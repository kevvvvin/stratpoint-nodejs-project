import { IKyc } from './';
import { JwtPayload } from 'shared-common';

type KycDetails = Pick<
  IKyc,
  'userId' | 'idType' | 'idNumber' | 'idExpiration' | 'submissionStatus'
>;

type UserDetails = {
  id: JwtPayload['sub'];
  email: JwtPayload['email'];
  kycStatus: JwtPayload['kycStatus'];
};

export interface KycResult {
  user: UserDetails;
  kyc: KycDetails;
}
