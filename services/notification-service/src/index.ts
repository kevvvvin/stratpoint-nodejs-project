import express, { Application } from 'express';
import cors from 'cors';
import mongoose, { ConnectOptions } from 'mongoose';
import { envConfig } from './configs';
import router from './routes';
import { errorHandler } from './middlewares';
import { logger } from './utils';
import { authenticateJWT } from 'shared-common';

const connectToDatabase = async (): Promise<void> => {
  try {
    logger.info(`Connecting to MongoDB at ${envConfig.mongoURI}`);
    await mongoose.connect(envConfig.mongoURI, {} as ConnectOptions);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.info('MongoDB Connection Error:, ', err);
  }
};
connectToDatabase();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use(authenticateJWT('notification-service', envConfig.userService as string));
app.use('/api', router);

app.use(errorHandler);

const PORT = envConfig.port;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

export default app;
