import { envConfig } from '../configs';
import { createServiceLogger } from 'shared-common';
import path from 'path';

const logDirectory = path.join(__dirname, '../../logs');

export const logger = createServiceLogger(
  'transaction-service',
  logDirectory,
  envConfig.logLevel,
  envConfig.nodeENV,
);
