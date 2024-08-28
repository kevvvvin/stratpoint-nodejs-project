import { KycSubmissionStatusEnum } from '../enums';
import { IKyc, JwtPayload, KycResult } from '../types';
import { KycRepository } from '../repositories';
import { KycSubmitRequestDto } from '../dtos';

export class KycService {
  constructor(private kycRepository: KycRepository) {}

  async initiate(userDetails: JwtPayload): Promise<KycResult> {
    const userId = userDetails.sub;
    const kyc = await this.kycRepository.findByUserId(userId);
    if (kyc) throw new Error('Could not initiate KYC. KYC is already initiated.');

    if (userDetails.kycStatus === 'VERIFIED') {
      throw new Error('Could not initiate KYC. User already approved');
    }

    const newKyc = await this.kycRepository.create(
      userId,
      KycSubmissionStatusEnum.INITIATED,
    );

    return {
      user: {
        id: userDetails.sub,
        email: userDetails.email,
        kycStatus: userDetails.kycStatus,
      },
      kyc: {
        userId: newKyc.userId,
        idType: newKyc.idType,
        idNumber: newKyc.idNumber,
        idExpiration: newKyc.idExpiration,
        submissionStatus: newKyc.submissionStatus,
      },
    };
  }

  async update(
    userDetails: JwtPayload,
    kycSubmission: KycSubmitRequestDto,
  ): Promise<KycResult> {
    const userId = userDetails.sub;
    const kyc = await this.kycRepository.findByUserId(userId);
    if (!kyc) throw new Error('Could not update KYC submission. KYC not found');

    if (
      kyc.submissionStatus === KycSubmissionStatusEnum.APPROVED ||
      kyc.submissionStatus === KycSubmissionStatusEnum.FOR_REVIEW
    ) {
      throw new Error('Could not update KYC submission. KYC already submitted');
    }

    const updateData: Partial<IKyc> = {
      idType: kycSubmission.idType,
      idNumber: kycSubmission.idNumber,
      idExpiration: kycSubmission.idExpiration as Date,
      submissionStatus: KycSubmissionStatusEnum.FOR_REVIEW,
    };

    const updatedKyc = await this.kycRepository.update(userId, updateData);
    if (!updatedKyc) throw new Error('Could not update KYC. KYC not found');

    return {
      user: {
        id: userDetails.sub,
        email: userDetails.email,
        kycStatus: userDetails.kycStatus,
      },
      kyc: {
        userId: updatedKyc.userId,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };
  }

  async approve(userDetails: JwtPayload, targetUserId: string): Promise<KycResult> {
    if (!userDetails.roles.includes('ADMIN'))
      throw new Error('Only admins can approve KYC');

    const kyc = await this.kycRepository.findByUserId(targetUserId);
    if (!kyc) throw new Error('Could not approve KYC. KYC not found');

    if (kyc.submissionStatus !== KycSubmissionStatusEnum.FOR_REVIEW) {
      throw new Error('Could not approve KYC. KYC not in FOR_REVIEW status');
    }

    const updatedKycData: Partial<IKyc> = {
      submissionStatus: KycSubmissionStatusEnum.APPROVED,
    };

    const updatedKyc = await this.kycRepository.update(targetUserId, updatedKycData);
    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');

    return {
      user: {
        id: updatedKyc.userId.toString(),
        email: userDetails.email,
        kycStatus: userDetails.kycStatus,
      },
      kyc: {
        userId: updatedKyc.userId,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };
  }

  async reject(userDetails: JwtPayload, targetUserId: string): Promise<KycResult> {
    if (!userDetails.roles.includes('ADMIN'))
      throw new Error('Only admins can approve KYC');

    const kyc = await this.kycRepository.findByUserId(targetUserId);
    if (!kyc) throw new Error('Could not reject KYC. KYC not found');

    if (kyc.submissionStatus !== KycSubmissionStatusEnum.FOR_REVIEW) {
      throw new Error('Could not reject KYC. KYC not in FOR_REVIEW status');
    }

    const updatedKycData: Partial<IKyc> = {
      submissionStatus: KycSubmissionStatusEnum.REJECTED,
    };

    const updatedKyc = await this.kycRepository.update(targetUserId, updatedKycData);
    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');

    return {
      user: {
        id: updatedKyc.userId.toString(),
        email: userDetails.email,
        kycStatus: userDetails.kycStatus,
      },
      kyc: {
        userId: updatedKyc.userId,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };
  }

  async getAllKyc(userDetails: JwtPayload): Promise<IKyc[]> {
    if (!userDetails.roles.includes('ADMIN'))
      throw new Error('Only admins can approve KYC');

    const kycs: IKyc[] = await this.kycRepository.findAll();
    return kycs;
  }

  async getKycByUserId(userDetails: JwtPayload, targetUserId: string): Promise<IKyc> {
    if (!userDetails.roles.includes('ADMIN') || userDetails.sub !== targetUserId)
      throw new Error('Access denied. You are not authorized to view this user.');

    const kyc = await this.kycRepository.findByUserId(targetUserId);
    if (!kyc) throw new Error('KYC does not exist.');

    return kyc;
  }
}
