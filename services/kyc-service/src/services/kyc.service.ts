import { KycSubmissionStatusEnum } from '../enums';
import { IKyc, KycResult } from '../types';
import { JwtPayload } from 'shared-common';
import { KycRepository } from '../repositories';
import { KycSubmitRequestDto } from '../dtos';
import { logger } from '../utils';
import { envConfig } from '../configs';
import { fetchHelper } from 'shared-common';
import { KycUpdateNotificationRequestDto } from 'shared-notification';

export class KycService {
  constructor(private kycRepository: KycRepository) {}

  async initiate(authHeader: string, userDetails: JwtPayload): Promise<KycResult> {
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

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/kyc-update-notification`,
        'POST',
        new KycUpdateNotificationRequestDto(userId, newKyc.submissionStatus, null),
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send kyc update notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

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
    authHeader: string,
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

    const updateKycStatusResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.userService}:3001/api/users/update-kyc-status/${userId}`,
      'PUT',
      { updatedStatus: 'PENDING' },
    );

    if (updateKycStatusResponse.status !== 200)
      throw new Error('Could not update KYC. Could not update user status');

    const updatedKyc = await this.kycRepository.update(userId, updateData);
    if (!updatedKyc) throw new Error('Could not update KYC. KYC not found');

    const updatedUser = (await updateKycStatusResponse.json()).result.user;

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/kyc-update-notification`,
        'POST',
        new KycUpdateNotificationRequestDto(userId, updatedKyc.submissionStatus, null),
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send kyc update notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

    return {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        kycStatus: updatedUser.kycStatus,
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

  async approve(
    authHeader: string,
    userDetails: JwtPayload,
    targetUserId: string,
  ): Promise<KycResult> {
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

    const updateKycStatusResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.userService}:3001/api/users/update-kyc-status/${targetUserId}`,
      'PUT',
      { updatedStatus: 'VERIFIED' },
    );

    if (updateKycStatusResponse.status !== 200)
      throw new Error('Could not update KYC. Could not update user status');

    const updatedKyc = await this.kycRepository.update(targetUserId, updatedKycData);
    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');

    const updatedUser = (await updateKycStatusResponse.json()).result.user;

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/kyc-update-notification`,
        'POST',
        new KycUpdateNotificationRequestDto(
          targetUserId,
          updatedKyc.submissionStatus,
          null,
        ),
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send kyc update notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

    return {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        kycStatus: updatedUser.kycStatus,
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

  async reject(
    authHeader: string,
    userDetails: JwtPayload,
    targetUserId: string,
  ): Promise<KycResult> {
    if (!userDetails.roles.includes('ADMIN'))
      throw new Error('Only admins can reject KYC');

    const kyc = await this.kycRepository.findByUserId(targetUserId);
    if (!kyc) throw new Error('Could not reject KYC. KYC not found');

    if (kyc.submissionStatus !== KycSubmissionStatusEnum.FOR_REVIEW) {
      throw new Error('Could not reject KYC. KYC not in FOR_REVIEW status');
    }

    const updatedKycData: Partial<IKyc> = {
      submissionStatus: KycSubmissionStatusEnum.REJECTED,
    };

    const updateKycStatusResponse = await fetchHelper(
      authHeader,
      `http://${envConfig.userService}:3001/api/users/update-kyc-status/${targetUserId}`,
      'PUT',
      { updatedStatus: 'TO_REVISE' },
    );

    if (updateKycStatusResponse.status !== 200)
      throw new Error('Could not update KYC. Could not update user status');

    const updatedKyc = await this.kycRepository.update(targetUserId, updatedKycData);
    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');

    const updatedUser = (await updateKycStatusResponse.json()).result.user;

    try {
      const notificationResponse = await fetchHelper(
        authHeader,
        `http://${envConfig.notificationService}:3006/api/notif/kyc-update-notification`,
        'POST',
        new KycUpdateNotificationRequestDto(
          targetUserId,
          updatedKyc.submissionStatus,
          'KYC Rejected due to ...',
        ),
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send kyc update notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

    return {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        kycStatus: updatedUser.kycStatus,
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
    if (!userDetails.roles.includes('ADMIN') && userDetails.sub !== targetUserId)
      throw new Error('Access denied. You are not authorized to view this user.');

    const kyc = await this.kycRepository.findByUserId(targetUserId);
    if (!kyc) throw new Error('KYC does not exist.');

    return kyc;
  }
}
