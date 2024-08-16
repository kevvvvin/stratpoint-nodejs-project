import jwt from 'jsonwebtoken';
import config from '../config';
import { StatusEnum, KycUserStatusEnum, RoleEnum } from '../enums';
import { JwtPayload, AuthResult, IUser, UserResult } from '../types';
import {
  RoleRepository,
  UserRepository,
  BlacklistedTokenRepository,
} from '../repositories';
import { LoginRequestDto, RegisterRequestDto } from '../dtos';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private blacklistedTokenRepository: BlacklistedTokenRepository,
  ) {}

  async register(data: RegisterRequestDto): Promise<UserResult> {
    const { email, password, firstName, lastName } = data;

    const [userRole, user] = await Promise.all([
      this.roleRepository.findByName(RoleEnum.USER),
      this.userRepository.findByEmail(email),
    ]);

    if (!userRole) throw new Error('User role not found. Roles are not initialized');
    if (user)
      throw new Error(`Registration failed. User with email ${email} already exists `);

    const newUser: IUser = await this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      status: StatusEnum.ACTIVE,
      kycStatus: KycUserStatusEnum.UNVERIFIED,
      roles: [userRole],
    });

    const registerResult: UserResult = {
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        status: newUser.status,
        kycStatus: newUser.kycStatus,
        roles: newUser.roles.map((role) => role.name),
      },
    };

    return registerResult;
  }

  async login(data: LoginRequestDto): Promise<AuthResult> {
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await user.checkPassword(password);
    if (!isMatch) throw new Error('Invalid email or password');

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: '1d',
    });

    const loginResult: AuthResult = {
      token,
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

    return loginResult;
  }

  async logout(token: string): Promise<AuthResult> {
    const decodedToken = jwt.decode(token) as JwtPayload;
    const expiresAt = new Date(decodedToken.exp * 1000);
    const user = await this.userRepository.findById(decodedToken.id);
    if (!user) throw new Error('Invalid token. User not found.');

    await this.blacklistedTokenRepository.create({ token, expiresAt });

    const logoutResult: AuthResult = {
      token,
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

    return logoutResult;
  }
}
