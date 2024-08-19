import jwt from 'jsonwebtoken';
import config from '../config';
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

    return jwt.sign(payload, config.jwtSecret, { expiresIn: '2h' });
  }

  async revokeToken(token: string): Promise<void> {
    const decodedToken = jwt.decode(token) as JwtPayload;
    const expiresAt = new Date(decodedToken.exp * 1000);

    await this.blacklistedTokenRepository.create({ token, expiresAt });
  }
}
