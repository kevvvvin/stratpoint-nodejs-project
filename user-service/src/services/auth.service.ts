import jwt from 'jsonwebtoken';
import config from '../config';
import { RoleEnum } from '../enums/role.enum';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import {
  AuthResponseBody,
  LoginRequestBody,
  RegisterRequestBody,
} from '../types/user.types';
import { StatusEnum } from '../enums/status.enum';
import { KycUserStatusEnum } from '../enums/kyc.enum';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
  ) {}

  async register(data: RegisterRequestBody): Promise<AuthResponseBody> {
    const { email, password, firstName, lastName } = data;

    const userRole = await this.roleRepository.findByName(RoleEnum.USER);
    if (!userRole) throw new Error('User role not found. Roles are not initialized');

    const user = await this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      status: StatusEnum.ACTIVE,
      kycStatus: KycUserStatusEnum.UNVERIFIED,
      roles: [userRole],
    });

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
        status: user.status,
        kycStatus: user.kycStatus,
        roles: user.roles.map((role) => role.name),
      },
    };

    return registerResponse;
  }

  async login(data: LoginRequestBody): Promise<AuthResponseBody> {
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email);
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
        status: user.status,
        kycStatus: user.kycStatus,
        roles: user.roles.map((role) => role.name),
      },
    };

    return loginResponse;
  }

  async logout(): Promise<void> {
    // get jwt token
    // get email or user id from jwt token
    // validate user
    // logout
    // blacklist the token
    // return json
    return;
  }
}
