import {
  RoleRepository,
  UserRepository,
  BlacklistedTokenRepository,
} from './repositories';
import { AuthService, UserService, JwtService } from './services';
import { AuthController, UserController } from './controllers';

const userRepository: UserRepository = new UserRepository();
const roleRepository: RoleRepository = new RoleRepository();
const blacklistedTokenRepository: BlacklistedTokenRepository =
  new BlacklistedTokenRepository();

const jwtService: JwtService = new JwtService(blacklistedTokenRepository);
const authService: AuthService = new AuthService(
  userRepository,
  roleRepository,
  jwtService,
);
const userService: UserService = new UserService(userRepository);

const authController: AuthController = new AuthController(authService);
const userController: UserController = new UserController(userService);

export { authController, userController };
