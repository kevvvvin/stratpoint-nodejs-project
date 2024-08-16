import { WalletRepository } from './repositories';
import { WalletService } from './services';
import { WalletController } from './controllers';

const walletRepository: WalletRepository = new WalletRepository();
const walletService: WalletService = new WalletService(walletRepository);
const walletController: WalletController = new WalletController(walletService);

export { walletController };
