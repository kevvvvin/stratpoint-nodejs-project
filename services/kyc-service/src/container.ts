import { KycRepository } from './repositories';
import { KycService } from './services';
import { KycController } from './controllers';

const kycRepository: KycRepository = new KycRepository();
const kycService: KycService = new KycService(kycRepository);
const kycController: KycController = new KycController(kycService);

export { kycController };
