import { NotificationService } from './services';
import { NotificationController } from './controllers';

const notificationService = new NotificationService();
const notificationController = new NotificationController(notificationService);

export { notificationController };
