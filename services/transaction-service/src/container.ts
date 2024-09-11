import { TransactionRepository } from './repositories';
import { TransactionService } from './services';
import { TransactionController } from './controllers';

const transactionRepository: TransactionRepository = new TransactionRepository();
const transactionService: TransactionService = new TransactionService(
  transactionRepository,
);
const transactionController: TransactionController = new TransactionController(
  transactionService,
);

export { transactionController };
