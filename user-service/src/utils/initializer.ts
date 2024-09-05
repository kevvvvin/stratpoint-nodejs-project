import { StatusEnum, RoleEnum, KycUserStatusEnum } from '../enums';
import { RoleType } from '../types';
import { Role, User } from '../models';
import { logger } from './';

const roles: RoleType[] = [
  { name: RoleEnum.ADMIN, description: 'Administrator with full privileges' },
  { name: RoleEnum.USER, description: 'Regular user with standard privileges' },
  { name: RoleEnum.SERVICE, description: 'Service account with full privileges' },
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
      status: StatusEnum.ACTIVE,
      kycStatus: KycUserStatusEnum.VERIFIED,
      roles: [adminRole],
      isEmailVerified: true,
    });

    await adminUser.save();
    logger.info('Admin initialized successfully');
  } catch (err) {
    logger.error(`Error initializing admin account: ${err}`);
  }
}

export async function initializeService(serviceName: string): Promise<void> {
  try {
    let serviceEmail = `${serviceName}@service.com`;
    let servicePassword = 'QWEqwe123!';

    const serviceRole = await Role.findOne({ name: RoleEnum.SERVICE });
    if (!serviceRole) {
      logger.error('Service role not found. Roles are not initialized');
      return;
    }

    const existingService = await User.findOne({ email: serviceEmail });
    if (existingService) {
      logger.info(`${serviceName} account is already initialized.`);
      return;
    }

    const serviceUser = new User({
      email: serviceEmail,
      password: servicePassword,
      firstName: 'SERVICE',
      lastName: 'ACCOUNT',
      status: StatusEnum.ACTIVE,
      kycStatus: KycUserStatusEnum.VERIFIED,
      roles: [serviceRole],
      isEmailVerified: true,
    });

    await serviceUser.save();
    logger.info(`${serviceName} account initialized successfully`);
  } catch (err) {
    logger.error(`Error initializing ${serviceName} account: ${err}`);
  }
}

export async function initializeVerifiedUser(email: string): Promise<void> {
  try {
    let userEmail = email;
    let userPassword = 'QWEqwe123!';

    const userRole = await Role.findOne({ name: RoleEnum.USER });
    if (!userRole) {
      logger.error('User role not found. Roles are not initialized');
      return;
    }

    const existingAdmin = await User.findOne({ email: userEmail });
    if (existingAdmin) {
      logger.info('Regular user is already initialized.');
      return;
    }

    const user = new User({
      email: userEmail,
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      status: StatusEnum.ACTIVE,
      kycStatus: KycUserStatusEnum.VERIFIED,
      roles: [userRole],
      isEmailVerified: true,
    });

    await user.save();
    logger.info('Regular user initialized successfully');
  } catch (err) {
    logger.error(`Error initializing regular user: ${err}`);
  }
}
