import { IKyc } from './';

type KycDetails = Pick<
  IKyc,
  'user' | 'idType' | 'idNumber' | 'idExpiration' | 'submissionStatus'
>;

export interface KycResult {
  kyc: KycDetails;
}
