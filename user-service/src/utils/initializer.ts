import Role from '../models/role.model';
import { RoleType } from '../types/role.types';
import { RoleEnum } from '../enums/role.enum';
import logger from './logger';

const roles: RoleType[] = [
  { name: RoleEnum.ADMIN, description: 'Administrator with full privileges' },
  { name: RoleEnum.USER, description: 'Regular user with standard privileges' },
];

const initializeRoles = async (): Promise<void> => {
  try {
    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        logger.info(`Role ${role.name} initialized with description: ${role.description}.`);
      } else {
        logger.info(`Role ${role.name} already exists.`);
      }
    }
  } catch (error) {
    logger.error('Error initializing roles:', error);
  }
};

export default initializeRoles;
