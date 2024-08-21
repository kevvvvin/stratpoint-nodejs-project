import * as dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from '../types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// console.log("Environment Variables: ", process.env);

const envConfig: EnvConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoURI: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  logLevel: process.env.LOG_LEVEL || '',
  nodeENV: process.env.NODE_ENV || '',
  stripeSecret: process.env.STRIPE_SECRET || '',
};

if (!envConfig.mongoURI) {
  throw new Error('Missing environment variable: MONGO_URI');
}

if (!envConfig.jwtSecret) {
  throw new Error('Missing environment variable: JWT_SECRET');
}

if (!envConfig.stripeSecret) {
  throw new Error('Missing environment variable: STRIPE_SECRET');
}

export { envConfig };
