import { KycRepository } from '../repositories/kyc.repository';
import { KycSubmissionBody } from '../types/request.types';
import { KycResponseBody } from '../types/response.types';
import { IKyc } from '../types/schema.types';
export class KycService {
  constructor(private kycRepository: KycRepository) {}

  async initiate(userId: string): Promise<IKyc> {
    const kyc = await this.kycRepository.initiate(userId);
    return kyc;
  }

  async update(userId: string, data: KycSubmissionBody): Promise<KycResponseBody | void> {
    const { idExpiration, ...rest } = data;

    const formattedData: Partial<IKyc> = {
      ...rest,
      idExpiration: new Date(idExpiration),
    };

    const kyc = await this.kycRepository.update(userId, formattedData);
    if (!kyc) throw new Error('Could not update KYC submission. KYC not found');

    const kycSubmitResponse: KycResponseBody = {
      kyc: {
        id: kyc._id,
        userId: kyc.userId,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    };

    return kycSubmitResponse;
  }
}
