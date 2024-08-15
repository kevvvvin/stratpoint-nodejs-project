import { RoleEnum } from '../enums';
import { IRole, IUser, UserResult } from '../types';
import { UserRepository } from '../repositories';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<UserResult[]> {
    const users = await this.userRepository.findAll();

    const usersResult: UserResult[] = users.map((user) => ({
      user: {
        id: user._id,
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
        id: user._id,
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
}
