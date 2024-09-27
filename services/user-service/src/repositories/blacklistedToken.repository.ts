import { ITokenBlacklist } from '../types';
import { BlacklistedToken } from '../models';
import { Types } from 'mongoose';

export class BlacklistedTokenRepository {
  async findById(id: string): Promise<ITokenBlacklist | null> {
    return await BlacklistedToken.findById(new Types.ObjectId(id));
  }

  async findByToken(token: string): Promise<ITokenBlacklist | null> {
    return await BlacklistedToken.findOne({ token });
  }

  async create(tokenDetails: Partial<ITokenBlacklist>): Promise<ITokenBlacklist> {
    return await BlacklistedToken.create(tokenDetails);
  }
}
