export interface EnvConfig {
  port: number;
  mongoURI: string;
  jwtSecret: string;
  logLevel: string;
  nodeENV: string;
  userService: string;
  transactionService: string;
  paymentService: string;
  notificationService: string;
}
