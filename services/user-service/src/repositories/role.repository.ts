import { RoleEnum } from '../enums';
import { IRole } from '../types';
import { Role } from '../models';
import { Types } from 'mongoose';

export class RoleRepository {
  async findById(id: string): Promise<IRole | null> {
    return await Role.findById(new Types.ObjectId(id));
  }

  async findByName(name: RoleEnum): Promise<IRole | null> {
    return await Role.findOne({ name });
  }
}
