export interface EnvConfig {
  port: number;
  mongoURI: string;
  jwtSecret: string;
  logLevel: string;
  nodeENV: string;
  stripeSecret: string;
  hostAddress: string;
}
