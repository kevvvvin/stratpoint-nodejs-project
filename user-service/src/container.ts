import {
  RoleRepository,
  UserRepository,
  KycRepository,
  BlacklistedTokenRepository,
} from './repositories';
import { AuthService, UserService, KycService, JwtService } from './services';
import { AuthController, UserController, KycController } from './controllers';

const userRepository: UserRepository = new UserRepository();
const roleRepository: RoleRepository = new RoleRepository();
const kycRepository: KycRepository = new KycRepository();
const blacklistedTokenRepository: BlacklistedTokenRepository =
  new BlacklistedTokenRepository();

const jwtService: JwtService = new JwtService(blacklistedTokenRepository);
const authService: AuthService = new AuthService(
  userRepository,
  roleRepository,
  jwtService,
);
const userService: UserService = new UserService(userRepository);
const kycService: KycService = new KycService(kycRepository, userRepository);

const authController: AuthController = new AuthController(authService);
const userController: UserController = new UserController(userService);
const kycController: KycController = new KycController(kycService);

export { authController, userController, kycController };
