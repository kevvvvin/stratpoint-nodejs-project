import { RoleEnum } from '../enums/role.enum';
import { UserRepository } from '../repositories/user.repository';
import { IRole, IUser } from '../types/schema.types';
import { UserResponseBody } from '../types/user.types';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<UserResponseBody[]> {
    const users = await this.userRepository.findAll();

    const usersResponse: UserResponseBody[] = users.map((user) => ({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.name),
      },
    }));

    return usersResponse;
  }

  async getUserById(id: string, loggedInUser: IUser): Promise<UserResponseBody> {
    const isSameUser = loggedInUser._id.toString() === id;
    const isAdmin = loggedInUser.roles.some(
      (role: IRole) => role.name === RoleEnum.ADMIN,
    );

    if (!isSameUser && !isAdmin)
      throw new Error('Access denied. You are not authorized to view this user.');

    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User does not exist.');

    const userResponse: UserResponseBody = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.name),
      },
    };

    return userResponse;
  }
}
