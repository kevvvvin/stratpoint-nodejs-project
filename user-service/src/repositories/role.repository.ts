import { RoleEnum } from '../enums/role.enum';
import { IRole } from '../types/schema.types';
import Role from '../models/role.model';

export class RoleRepository {
  async findById(id: string): Promise<IRole | null> {
    return Role.findById(id);
  }

  async findByName(name: RoleEnum): Promise<IRole | null> {
    return Role.findOne({ name });
  }
}
