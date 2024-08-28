import * as dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from '../types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// console.log("Environment Variables: ", process.env);

const envConfig: EnvConfig = {
  port: parseInt(process.env.PORT || '3002', 10),
  mongoURI: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  logLevel: process.env.LOG_LEVEL || '',
  nodeENV: process.env.NODE_ENV || '',
  userService: process.env.USER_SERVICE_URL || 'localhost',
  transactionService: process.env.TRANSACTION_SERVICE_URL || 'localhost',
  paymentService: process.env.PAYMENT_SERVICE_URL || 'localhost',
};

if (!envConfig.mongoURI) {
  throw new Error('Missing environment variable: MONGO_URI');
}

if (!envConfig.jwtSecret) {
  throw new Error('Missing environment variable: JWT_SECRET');
}

export { envConfig };
