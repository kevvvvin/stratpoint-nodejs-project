import jwt from 'jsonwebtoken';
import { envConfig } from '../configs';
import { IUser, JwtPayload } from '../types';
import { BlacklistedTokenRepository } from '../repositories';

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

    return jwt.sign(payload, envConfig.jwtSecret as string, { expiresIn: '2h' });
  }

  async generateServiceToken(service: IUser): Promise<string> {
    const payload: Omit<JwtPayload, 'exp'> = {
      sub: service._id.toString(),
      email: service.email,
      roles: service.roles.map((role) => role.name),
      status: service.status,
      kycStatus: service.kycStatus,
    };

    return jwt.sign(payload, envConfig.jwtSecret as string, { expiresIn: '2m' });
  }

  async revokeToken(token: string): Promise<void> {
    const decodedToken = jwt.decode(token) as JwtPayload;
    const expiresAt = new Date(decodedToken.exp * 1000);

    await this.blacklistedTokenRepository.create({ token, expiresAt });
  }
}
