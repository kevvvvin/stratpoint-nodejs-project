import { ITokenBlacklist } from '../types';
import { BlacklistedToken } from '../models';

export class BlacklistedTokenRepository {
  async findById(id: string): Promise<ITokenBlacklist | null> {
    return BlacklistedToken.findById(id);
  }

  async findByToken(token: string): Promise<ITokenBlacklist | null> {
    return BlacklistedToken.findOne({ token });
  }

  async create(tokenDetails: Partial<ITokenBlacklist>): Promise<ITokenBlacklist> {
    return BlacklistedToken.create(tokenDetails);
  }
}
