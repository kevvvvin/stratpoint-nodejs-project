import { RoleEnum } from '../enums';
import { IRole } from '../types';
import { Role } from '../models';

export class RoleRepository {
  async findById(id: string): Promise<IRole | null> {
    return Role.findById(id);
  }

  async findByName(name: RoleEnum): Promise<IRole | null> {
    return Role.findOne({ name });
  }
}
