import { RoleEnum } from '../enums/role.enum';
import User from '../models/user.model';
import { UserResponseBody } from '../types/response.types';
import { IRole, IUser } from '../types/schema.types';

const getAllUsers = async (): Promise<UserResponseBody[]> => {
  const users = await User.find({}).populate('roles', 'name');

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
};

const getUserById = async (
  id: string,
  loggedInUser: IUser,
): Promise<UserResponseBody> => {
  const isSameUser = loggedInUser._id.toString() === id;
  const isAdmin = loggedInUser.roles.some((role: IRole) => role.name === RoleEnum.ADMIN);

  if (!isSameUser && !isAdmin)
    throw new Error('Access denied. You are not authorized to view this user.');

  const user = await User.findById(id).populate('roles', 'name');
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
};

export const UserService = {
  getAllUsers,
  getUserById,
};
