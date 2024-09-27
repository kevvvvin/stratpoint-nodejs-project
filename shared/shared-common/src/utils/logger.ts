import { createLogger, Logger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, errors, splat, json, colorize, simple } = format;

// Centralized log directory (root/logs)
const centralizedLogDirectory = path.resolve(__dirname, '../../../../logs');

// Base logger configuration
export const baseLogger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    splat(),
    json(), // JSON format for structured logs
  ),
  // Centralized logging transport
  transports: [
    new transports.File({
      filename: path.join(centralizedLogDirectory, 'combined.log'),
      level: 'info',
    }),

    new transports.File({
      filename: path.join(centralizedLogDirectory, 'error.log'),
      level: 'error',
    }),
  ],
});

// Function to create a service-specific logger
export const createServiceLogger = (
  serviceName: string,
  logDirectory: string,
  logLevel: string,
  environment: string,
): Logger => {
  // Create a child logger that inherits from the base logger
  const serviceLogger = baseLogger.child({ service: serviceName });

  serviceLogger.level = logLevel;

  // Add service-specific file transports
  serviceLogger.add(
    new transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    }),
  );

  serviceLogger.add(
    new transports.File({
      filename: path.join(logDirectory, 'combined.log'),
    }),
  );

  if (environment !== 'production') {
    serviceLogger.add(
      new transports.Console({
        format: combine(colorize(), simple()),
      }),
    );
  }

  return serviceLogger;
};
