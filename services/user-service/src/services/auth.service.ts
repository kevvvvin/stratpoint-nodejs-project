import crypto from 'crypto';
import { StatusEnum, KycUserStatusEnum, RoleEnum, ServiceEnum } from '../enums';
import { AuthResult, IUser, UserResult } from '../types';
import { RoleRepository, UserRepository } from '../repositories';
import { JwtService } from './';
import { LoginRequestDto, RegisterRequestDto } from '../dtos';
import { fetchHelper } from 'shared-common';
import { envConfig } from '../configs';
import { logger } from '../utils';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private jwtService: JwtService,
  ) {}

  async register(serviceToken: string, data: RegisterRequestDto): Promise<UserResult> {
    const { email, password, firstName, lastName } = data;

    const [userRole, user] = await Promise.all([
      this.roleRepository.findByName(RoleEnum.USER),
      this.userRepository.findByEmail(email),
    ]);

    if (!userRole) throw new Error('User role not found. Roles are not initialized');
    if (user)
      throw new Error(`Registration failed. User with email ${email} already exists `);

    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const emailVerificationExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser: IUser = await this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      status: StatusEnum.ACTIVE,
      kycStatus: KycUserStatusEnum.UNVERIFIED,
      roles: [userRole],
      emailVerificationToken,
      emailVerificationExpiration,
    });

    try {
      const notificationResponse = await fetchHelper(
        `Bearer ${serviceToken}`,
        `http://${envConfig.notificationService}:3006/api/notif/email-verification-notification`,
        'POST',
        { userId: newUser._id, emailVerificationToken },
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send email verification notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
    }

    const registerResult: UserResult = {
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        status: newUser.status,
        kycStatus: newUser.kycStatus,
        roles: newUser.roles.map((role) => role.name),
        isEmailVerified: newUser.isEmailVerified,
      },
    };

    return registerResult;
  }

  async verifyEmail(emailVerificationToken: string): Promise<UserResult> {
    const user =
      await this.userRepository.findByEmailVerificationToken(emailVerificationToken);
    if (!user) {
      throw new Error('Invalid email verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiration = undefined;
    await user.save();

    const verificationResult: UserResult = {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        kycStatus: user.kycStatus,
        roles: user.roles.map((role) => role.name),
        isEmailVerified: user.isEmailVerified,
      },
    };

    return verificationResult;
  }

  // TODO: For better practice, implement refresh token mechanisms.
  async login(serviceToken: string, data: LoginRequestDto): Promise<AuthResult> {
    const { email, password } = data;

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await user.checkPassword(password);
    if (!isMatch) throw new Error('Invalid email or password');

    const isEmailVerified = user.isEmailVerified;
    const isEmailVerificationExpired =
      (user.emailVerificationExpiration as Date) < new Date();
    if (!isEmailVerified && isEmailVerificationExpired) {
      try {
        user.emailVerificationToken = crypto.randomBytes(20).toString('hex');
        user.emailVerificationExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const notificationResponse = await fetchHelper(
          `Bearer ${serviceToken}`,
          `http://${envConfig.notificationService}:3006/api/notif/email-verification-notification`,
          'POST',
          { userId: user._id, emailVerificationToken: user.emailVerificationToken },
        );

        if (notificationResponse.status !== 200) {
          logger.warn('Failed to send email verification notification');
        }
      } catch (err) {
        logger.warn('Failed to send request to notification service: ', err);
      }
      throw new Error(
        'Please verify your email before logging in. Check your inbox for the verification link.',
      );
    } else if (!isEmailVerified && !isEmailVerificationExpired) {
      throw new Error(
        'Please verify your email before logging in. Check your inbox for the verification link.',
      );
    }

    // Generate a JWT token
    const token = await this.jwtService.generateToken(user);

    try {
      const notificationResponse = await fetchHelper(
        `Bearer ${token}`,
        `http://${envConfig.notificationService}:3006/api/notif/login-notification`,
        'POST',
      );

      if (notificationResponse.status !== 200) {
        logger.warn('Failed to send login notification');
      }
    } catch (err) {
      logger.warn('Failed to send request to notification service: ', err);
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
        isEmailVerified: user.isEmailVerified,
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
        isEmailVerified: user.isEmailVerified,
      },
    };

    return logoutResult;
  }

  async generateServiceToken(serviceName: string): Promise<string> {
    if (!Object.values(ServiceEnum).includes(serviceName as ServiceEnum)) {
      throw new Error(`Invalid service name: ${serviceName}.`);
    }

    const serviceAccount = await this.userRepository.findByEmail(
      `${serviceName}@service.com`,
    );
    if (!serviceAccount) throw new Error(`'${serviceName} account not found.`);

    const serviceToken = await this.jwtService.generateServiceToken(serviceAccount);

    return serviceToken;
  }
}
