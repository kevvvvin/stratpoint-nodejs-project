import { KycSubmissionStatusEnum } from '../enums/kyc.enum';
import { KycRepository } from '../repositories/kyc.repository';
import { KycResponseBody, KycSubmissionBody } from '../types/kyc.types';
import { IKyc, IUser } from '../types/schema.types';
export class KycService {
  constructor(private kycRepository: KycRepository) {}

  async initiate(userId: string, loggedInUser: IUser): Promise<KycResponseBody> {
    const isSameUser = loggedInUser._id.toString() === userId;
    if (!isSameUser)
      throw new Error(
        "Access denied. You do not have permission to update this user's KYC.",
      );

    const kyc = await this.kycRepository.create(
      userId,
      KycSubmissionStatusEnum.INITIATED,
    );

    const kycInitiateResponse = {
      kyc: {
        id: kyc._id,
        userId: kyc.userId,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    };

    return kycInitiateResponse;
  }

  async update(
    userId: string,
    loggedInUser: IUser,
    data: KycSubmissionBody,
  ): Promise<KycResponseBody> {
    const isSameUser = loggedInUser._id.toString() === userId;
    if (!isSameUser)
      throw new Error(
        "Access denied. You do not have permission to update this user's KYC.",
      );

    const kyc = await this.kycRepository.findByUserId(userId);
    if (!kyc) throw new Error('Could not update KYC submission. KYC not found');

    if (
      kyc.submissionStatus === KycSubmissionStatusEnum.APPROVED ||
      kyc.submissionStatus === KycSubmissionStatusEnum.FOR_REVIEW
    ) {
      throw new Error('Could not update KYC submission. KYC already submitted');
    }

    const updateData: Partial<IKyc> = {
      idType: data.idType,
      idNumber: data.idNumber,
      idExpiration: new Date(data.idExpiration),
      submissionStatus: KycSubmissionStatusEnum.FOR_REVIEW,
    };

    const updatedKyc = await this.kycRepository.update(userId, updateData);
    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');

    const kycSubmitResponse: KycResponseBody = {
      kyc: {
        id: updatedKyc._id,
        userId: updatedKyc.userId,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };

    return kycSubmitResponse;
  }
}
