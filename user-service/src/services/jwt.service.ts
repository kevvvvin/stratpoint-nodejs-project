import jwt from 'jsonwebtoken';
import { envConfig } from '../configs';
import { IUser, JwtPayload } from '../types';
import { BlacklistedTokenRepository } from '../repositories';
import { RoleEnum, StatusEnum, KycUserStatusEnum } from '../enums';

export class JwtService {
  constructor(private blacklistedTokenRepository: BlacklistedTokenRepository) {}

  async generateToken(user: IUser): Promise<string> {
    const payload: Omit<JwtPayload, 'exp'> = {
      sub: user._id.toString(),
      email: user.email,
      roles: user.roles.map((role) => role.name),
      status: user.status,
      kycStatus: user.kycStatus,
    };

    return jwt.sign(payload, envConfig.jwtSecret, { expiresIn: '2h' });
  }

  async generateAdminToken(service: string, role: RoleEnum): Promise<string> {
    const payload: Omit<JwtPayload, 'exp'> = {
      sub: service,
      email: `${service}@service.com`,
      roles: [role],
      status: StatusEnum.ACTIVE,
      kycStatus: KycUserStatusEnum.VERIFIED,
    };

    return jwt.sign(payload, envConfig.jwtSecret, { expiresIn: '2m' });
  }

  async revokeToken(token: string): Promise<void> {
    const decodedToken = jwt.decode(token) as JwtPayload;
    const expiresAt = new Date(decodedToken.exp * 1000);

    await this.blacklistedTokenRepository.create({ token, expiresAt });
  }
}
