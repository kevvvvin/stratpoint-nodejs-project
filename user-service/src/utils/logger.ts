import { createLogger, format, transports } from 'winston';
import config from '../config';
import path from 'path';

const { combine, timestamp, errors, splat, json, colorize, simple } = format;

const logDirectory = path.join(__dirname, '../../logs');

export const logger = createLogger({
  level: config.logLevel || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    splat(),
    json(),
  ),
  defaultMeta: { service: 'e-wallet-api' },
  transports: [
    new transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    }),
    new transports.File({ filename: path.join(logDirectory, 'combined.log') }),
  ],
});

if (config.nodeENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), simple()),
    }),
  );
}
