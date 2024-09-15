export interface EnvConfig {
  port: number;
  mongoURI: string;
  jwtSecret?: string;
  logLevel: string;
  nodeENV: string;
  serviceSecret?: string;
  stripeSecret?: string;
  mailHogUrl?: string;
  userService?: string;
  transactionService?: string;
  paymentService?: string;
  notificationService?: string;
}