import { KycUserStatusEnum, RoleEnum } from '../enums';
import { IRole, IUser, UserResult } from '../types';
import { UserRepository } from '../repositories';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<UserResult[]> {
    const users = await this.userRepository.findAll();

    const usersResult: UserResult[] = users.map((user) => ({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        kycStatus: user.kycStatus,
        roles: user.roles.map((role) => role.name),
      },
    }));

    return usersResult;
  }

  async getUserById(id: string, loggedInUser: IUser): Promise<UserResult> {
    const isSameUser = loggedInUser._id.toString() === id;
    const isAdmin = loggedInUser.roles.some(
      (role: IRole) => role.name === RoleEnum.ADMIN,
    );

    if (!isSameUser && !isAdmin)
      throw new Error('Access denied. You are not authorized to view this user.');

    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User does not exist.');

    const userResult: UserResult = {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        kycStatus: user.kycStatus,
        roles: user.roles.map((role) => role.name),
      },
    };

    return userResult;
  }

  async updateKycStatus(
    loggedInUser: IUser,
    targetUserId: string,
    updatedStatus: string,
  ): Promise<UserResult> {
    const isSameUser = loggedInUser._id.toString() === targetUserId;
    const isAdmin = loggedInUser.roles.some(
      (role: IRole) => role.name === RoleEnum.ADMIN,
    );

    if (!isSameUser && !isAdmin)
      throw new Error('Access denied. You are not authorized to view this user.');

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) throw new Error('User does not exist.');

    const convertedStatus: KycUserStatusEnum =
      KycUserStatusEnum[updatedStatus as keyof typeof KycUserStatusEnum];

    targetUser.kycStatus = convertedStatus;
    await targetUser.save();

    const userResult: UserResult = {
      user: {
        _id: targetUser._id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        status: targetUser.status,
        kycStatus: targetUser.kycStatus,
        roles: targetUser.roles.map((role) => role.name),
      },
    };

    return userResult;
  }
}
