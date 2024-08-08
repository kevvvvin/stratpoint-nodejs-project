import Role from '../models/role.model';
import { RoleType } from '../types/role.types';
import { RoleEnum } from '../enums/role.enum';
import logger from './logger';
import User from '../models/user.model';

const roles: RoleType[] = [
  { name: RoleEnum.ADMIN, description: 'Administrator with full privileges' },
  { name: RoleEnum.USER, description: 'Regular user with standard privileges' },
];

export async function initializeRoles(): Promise<void> {
  try {
    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        logger.info(
          `Role ${role.name} initialized with description: ${role.description}.`,
        );
      } else {
        logger.info(`Role ${role.name} already exists.`);
      }
    }
  } catch (err) {
    logger.error(`Error initializing roles: ${err}`);
  }
}

export async function initializeAdmin(): Promise<void> {
  try {
    let adminEmail = 'admin@gmail.com';
    let adminPassword = 'QWEqwe123!';

    const adminRole = await Role.findOne({ name: RoleEnum.ADMIN });
    if (!adminRole) {
      logger.error('Admin role not found. Roles are not initialized');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      logger.info('Admin account is already initialized.');
      return;
    }

    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      firstName: 'John',
      lastName: 'Doe',
      roles: [adminRole],
    });

    await adminUser.save();
    logger.info('Admin account initialized successfully');
  } catch (err) {
    logger.error(`Error initializing admin account: ${err}`);
  }
}
