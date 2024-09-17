export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  status: string;
  kycStatus: string;
  exp: number;
}
