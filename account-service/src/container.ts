import { PaymentMethodRepository, WalletRepository } from './repositories';
import { WalletService } from './services';
import { WalletController } from './controllers';

const walletRepository: WalletRepository = new WalletRepository();
const paymentMethodRepository: PaymentMethodRepository = new PaymentMethodRepository();
const walletService: WalletService = new WalletService(
  walletRepository,
  paymentMethodRepository,
);
const walletController: WalletController = new WalletController(walletService);

export { walletController };
