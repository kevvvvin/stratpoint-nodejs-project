import { KycSubmissionStatusEnum, KycUserStatusEnum } from '../enums/kyc.enum';
import { RoleEnum } from '../enums/role.enum';
import { KycRepository } from '../repositories/kyc.repository';
import { UserRepository } from '../repositories/user.repository';
import { KycResponseBody, KycSubmissionBody } from '../types/kyc.types';
import { IKyc, IRole, IUser } from '../types/schema.types';
export class KycService {
  constructor(
    private kycRepository: KycRepository,
    private userRepository: UserRepository,
  ) {}

  async initiate(userId: string): Promise<KycResponseBody> {
    const kyc = await this.kycRepository.create(
      userId,
      KycSubmissionStatusEnum.INITIATED,
    );

    const kycInitiateResponse = {
      kyc: {
        id: kyc._id,
        user: kyc.user,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    };

    return kycInitiateResponse;
  }

  async update(userId: string, data: KycSubmissionBody): Promise<KycResponseBody> {
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
    const kycSubmitResponse: KycResponseBody = {
      kyc: {
        id: updatedKyc._id,
        user: updatedKyc.user,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };

    return kycSubmitResponse;
  }

  async approve(userId: string): Promise<KycResponseBody> {
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
    const kycApproveResponse: KycResponseBody = {
      kyc: {
        id: updatedKyc._id,
        user: updatedKyc.user,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };

    return kycApproveResponse;
  }

  async reject(userId: string): Promise<KycResponseBody> {
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
    const kycRejectResponse: KycResponseBody = {
      kyc: {
        id: updatedKyc._id,
        user: updatedKyc.user,
        idType: updatedKyc.idType,
        idNumber: updatedKyc.idNumber,
        idExpiration: updatedKyc.idExpiration,
        submissionStatus: updatedKyc.submissionStatus,
      },
    };

    return kycRejectResponse;
  }

  async getAllKyc(): Promise<KycResponseBody[]> {
    const kycs: IKyc[] = await this.kycRepository.findAll();
    const kycsResponse: KycResponseBody[] = kycs.map((kyc) => ({
      kyc: {
        id: kyc._id,
        user: kyc.user,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    }));
    return kycsResponse;
  }

  async getKycByUserId(userId: string, loggedInUser: IUser): Promise<KycResponseBody> {
    const isSameUser = loggedInUser._id.toString() === userId;
    const isAdmin = loggedInUser.roles.some(
      (role: IRole) => role.name === RoleEnum.ADMIN,
    );

    if (!isSameUser && !isAdmin)
      throw new Error('Access denied. You are not authorized to view this user.');

    const kyc = await this.kycRepository.findByUserId(userId);
    if (!kyc) throw new Error('KYC does not exist.');

    const kycResponse: KycResponseBody = {
      kyc: {
        id: kyc._id,
        user: kyc.user,
        idType: kyc.idType,
        idNumber: kyc.idNumber,
        idExpiration: kyc.idExpiration,
        submissionStatus: kyc.submissionStatus,
      },
    };
    return kycResponse;
  }
}
