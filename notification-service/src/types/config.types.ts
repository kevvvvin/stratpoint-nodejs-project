export interface EnvConfig {
  port: number;
  mongoURI: string;
  jwtSecret: string;
  logLevel: string;
  nodeENV: string;
  mailHogUrl: string;
  userService: string;
}
