import express, { Application } from 'express';
import cors from 'cors';
import mongoose, { ConnectOptions } from 'mongoose';

import config from './config';
import router from './routes';
import logger from './utils/logger';
import errorHandler from './middlewares/error.middleware';
import initializeRoles from './utils/initializer';

const connectToDatabase = async (): Promise<void> => {
  try {
    logger.info(`Connecting to MongoDB at ${config.mongoURI}`);
    await mongoose.connect(config.mongoURI, {} as ConnectOptions);
    logger.info('Connected to MongoDB');

    await initializeRoles();
  } catch (err) {
    logger.info('MongoDB Connection Error:, ', err);
  }
};
connectToDatabase();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

export default app;
