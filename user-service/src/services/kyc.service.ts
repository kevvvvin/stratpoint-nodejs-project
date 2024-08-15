import { RoleEnum, KycSubmissionStatusEnum, KycUserStatusEnum } from '../enums';
import { IKyc, IRole, IUser, KycResult } from '../types';
import { UserRepository, KycRepository } from '../repositories';
import { KycSubmitRequestDto } from '../dtos';

export class KycService {
  constructor(
    private kycRepository: KycRepository,
    private userRepository: UserRepository,
  ) {}

  async initiate(userId: string): Promise<KycResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Could not initiate KYC. User not found');

    if (user.kycStatus === KycUserStatusEnum.VERIFIED) {
      throw new Error('Could not initiate KYC. User already approved');
    }

    const kyc = await this.kycRepository.create(
      userId,
      KycSubmissionStatusEnum.INITIATED,
    );

    const kycResult: KycResult = {
      kyc: {
        id: kyc._id,
        user: kyc.user,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    };

    return kycResult;
  }

  async update(userId: string, data: KycSubmitRequestDto): Promise<KycResult> {
    // Fetch KYC and User in parallel
    const [kyc, user] = await Promise.all([
      this.kycRepository.findByUserId(userId),
      this.userRepository.findById(userId),
    ]);

    if (!kyc) throw new Error('Could not update KYC submission. KYC not found');
    if (!user) throw new Error("Could not update the user's KYC status. User not found");

    if (
      kyc.submissionStatus === KycSubmissionStatusEnum.APPROVED ||
      kyc.submissionStatus === KycSubmissionStatusEnum.FOR_REVIEW
    ) {
      throw new Error('Could not update KYC submission. KYC already submitted');
    }

    // Prepare data for updates
    const updateData: Partial<IKyc> = {
      idType: data.idType,
      idNumber: data.idNumber,
      idExpiration: new Date(data.idExpiration),
      // idExpiration: data.idExpiration,
      submissionStatus: KycSubmissionStatusEnum.FOR_REVIEW,
    };

    const updatedUserData: Partial<IUser> = {
      kycStatus: KycUserStatusEnum.PENDING,
    };

    // Update KYC and User in parallel
    const [updatedKyc, updatedUser] = await Promise.all([
      this.kycRepository.update(userId, updateData),
      this.userRepository.update(userId, updatedUserData),
    ]);

    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');
    if (!updatedUser)
      throw new Error("Could not update the User's KYC status. User not found");

    // Construct and return the response
    const kycSubmitResult: KycResult = {
      kyc: {
        id: updatedKyc._id,
        user: updatedKyc.user,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };

    return kycSubmitResult;
  }

  async approve(userId: string): Promise<KycResult> {
    // Fetch KYC and User in parallel
    const [kyc, user] = await Promise.all([
      this.kycRepository.findByUserId(userId),
      this.userRepository.findById(userId),
    ]);

    if (!kyc) throw new Error('Could not approve KYC. KYC not found');
    if (!user) throw new Error('Could not verify the user. User not found');

    if (kyc.submissionStatus !== KycSubmissionStatusEnum.FOR_REVIEW) {
      throw new Error('Could not approve KYC. KYC not in FOR_REVIEW status');
    }

    // Prepare data for updates
    const updatedKycData: Partial<IKyc> = {
      submissionStatus: KycSubmissionStatusEnum.APPROVED,
    };

    const updatedUserData: Partial<IUser> = {
      kycStatus: KycUserStatusEnum.VERIFIED,
    };

    // Update KYC and User in parallel
    const [updatedKyc, updatedUser] = await Promise.all([
      this.kycRepository.update(userId, updatedKycData),
      this.userRepository.update(userId, updatedUserData),
    ]);

    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');
    if (!updatedUser)
      throw new Error("Could not update the User's KYC status. User not found");

    // Construct and return the response
    const kycApproveResult: KycResult = {
      kyc: {
        id: updatedKyc._id,
        user: updatedKyc.user,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };

    return kycApproveResult;
  }

  async reject(userId: string): Promise<KycResult> {
    // Fetch KYC and User in parallel
    const [kyc, user] = await Promise.all([
      this.kycRepository.findByUserId(userId),
      this.userRepository.findById(userId),
    ]);

    if (!kyc) throw new Error('Could not reject KYC. KYC not found');
    if (!user) throw new Error('Could not verify the user. User not found');

    if (kyc.submissionStatus !== KycSubmissionStatusEnum.FOR_REVIEW) {
      throw new Error('Could not reject KYC. KYC not in FOR_REVIEW status');
    }

    // Prepare data for updates
    const updatedKycData: Partial<IKyc> = {
      submissionStatus: KycSubmissionStatusEnum.REJECTED,
    };

    const updatedUserData: Partial<IUser> = {
      kycStatus: KycUserStatusEnum.TO_REVISE,
    };

    // Update KYC and User in parallel
    const [updatedKyc, updatedUser] = await Promise.all([
      this.kycRepository.update(userId, updatedKycData),
      this.userRepository.update(userId, updatedUserData),
    ]);

    if (!updatedKyc) throw new Error('Could not update KYC submission. KYC not found');
    if (!updatedUser)
      throw new Error("Could not update the User's KYC status. User not found");

    // Construct and return the response
    const kycRejectResult: KycResult = {
      kyc: {
        id: updatedKyc._id,
        user: updatedKyc.user,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };

    return kycRejectResult;
  }

  async getAllKyc(): Promise<KycResult[]> {
    const kycs: IKyc[] = await this.kycRepository.findAll();
    const kycsResult: KycResult[] = kycs.map((kyc) => ({
      kyc: {
        id: kyc._id,
        user: kyc.user,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    }));
    return kycsResult;
  }

  async getKycByUserId(userId: string, loggedInUser: IUser): Promise<KycResult> {
    const isSameUser = loggedInUser._id.toString() === userId;
    const isAdmin = loggedInUser.roles.some(
      (role: IRole) => role.name === RoleEnum.ADMIN,
    );

    if (!isSameUser && !isAdmin)
      throw new Error('Access denied. You are not authorized to view this user.');

    const kyc = await this.kycRepository.findByUserId(userId);
    if (!kyc) throw new Error('KYC does not exist.');

    const kycResult: KycResult = {
      kyc: {
        id: kyc._id,
        user: kyc.user,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    };
    return kycResult;
  }
}
