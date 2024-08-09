import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

const userRepository: UserRepository = new UserRepository();
const roleRepository: RoleRepository = new RoleRepository();

const authService: AuthService = new AuthService(userRepository, roleRepository);
const userService: UserService = new UserService(userRepository);

const authController: AuthController = new AuthController(authService);
const userController: UserController = new UserController(userService);

export { authController, userController };
