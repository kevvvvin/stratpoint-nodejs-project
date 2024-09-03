import { StatusEnum, KycUserStatusEnum, RoleEnum } from '../enums';
import { AuthResult, IUser, UserResult } from '../types';
import { RoleRepository, UserRepository } from '../repositories';
import { JwtService } from './';
import { LoginRequestDto, RegisterRequestDto } from '../dtos';
import { fetchHelper } from '../utils/fetchHelper';
import { envConfig } from '../configs';
import { logger } from '../utils';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private jwtService: JwtService,
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
    const token = await this.jwtService.generateToken(user);

    try {
      const notificationResponse = await fetchHelper(
        `Bearer ${token}`,
        `http://${envConfig.notificationService}:3006/api/notif/login-notification`,
        'POST',
        null,
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send login notification');
      }
    } catch (err) {
      logger.warn('Failed to send login notification: ', err);
    }

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

  async logout(token: string, user: IUser): Promise<AuthResult> {
    await this.jwtService.revokeToken(token);

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

  async generateAdminToken(serviceName: string): Promise<string> {
    const adminRole = await this.roleRepository.findByName(RoleEnum.ADMIN);
    if (!adminRole) throw new Error('Admin role not found. Roles are not initialized');

    const roleName = adminRole.name;
    const adminToken = await this.jwtService.generateAdminToken(serviceName, roleName);

    return adminToken;
  }
}
