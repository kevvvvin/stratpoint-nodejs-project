import User from '../models/user.model';
import Role from '../models/role.model';
import jwt from 'jsonwebtoken';
import config from '../config';
import { RegisterRequestBody, LoginRequestBody } from '../types/request.types';
import { AuthResponseBody } from '../types/response.types';
import { RoleEnum } from '../enums/role.enum';

const register = async (data: RegisterRequestBody): Promise<AuthResponseBody> => {
  const { email, password, firstName, lastName } = data;

  const userRole = await Role.findOne({ name: RoleEnum.USER });
  if (!userRole) throw new Error('User role not found. Roles are not initialized');

  const user = new User({ email, password, firstName, lastName, roles: [userRole] });
  await user.save();

  const token = jwt.sign({ id: user._id }, config.jwtSecret, {
    expiresIn: '1d',
  });

  const registerResponse: AuthResponseBody = {
    token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((role) => role.name),
    },
  };

  return registerResponse;
};

const login = async (data: LoginRequestBody): Promise<AuthResponseBody> => {
  const { email, password } = data;

  const user = await User.findOne({ email }).populate('roles', 'name');
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await user.checkPassword(password);
  if (!isMatch) throw new Error('Invalid email or password');

  // Generate a JWT token
  const token = jwt.sign({ id: user._id }, config.jwtSecret, {
    expiresIn: '1d',
  });

  const loginResponse: AuthResponseBody = {
    token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((role) => role.name),
    },
  };

  return loginResponse;
};

const logout = async (): Promise<void> => {
  // get jwt token
  // get email or user id from jwt token
  // validate user
  // logout
  // blacklist the token
  // return json
  return;
};

export const AuthService = {
  register,
  login,
  logout,
};
