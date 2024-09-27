import * as dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from 'shared-common';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envConfig: EnvConfig = {
  port: parseInt(process.env.PORT || '3005', 10),
  mongoURI: process.env.MONGO_URI || '',
  logLevel: process.env.LOG_LEVEL || '',
  nodeENV: process.env.NODE_ENV || '',
  serviceSecret: process.env.SERVICE_COMMUNICATION_SECRET || '',
  mailHogUrl: process.env.MAILHOG_URL || 'localhost',
  userService: process.env.USER_SERVICE_URL || 'localhost',
};

if (!envConfig.mongoURI) {
  throw new Error('Missing environment variable: MONGO_URI');
}

export { envConfig };
