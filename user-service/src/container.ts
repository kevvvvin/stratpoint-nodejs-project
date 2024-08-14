import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { KycRepository } from './repositories/kyc.repository';
import { KycService } from './services/kyc.service';
import { KycController } from './controllers/kyc.controller';

const userRepository: UserRepository = new UserRepository();
const roleRepository: RoleRepository = new RoleRepository();
const kycRepository: KycRepository = new KycRepository();

const authService: AuthService = new AuthService(userRepository, roleRepository);
const userService: UserService = new UserService(userRepository);
const kycService: KycService = new KycService(kycRepository, userRepository);

const authController: AuthController = new AuthController(authService);
const userController: UserController = new UserController(userService);
const kycController: KycController = new KycController(kycService);

export { authController, userController, kycController };
