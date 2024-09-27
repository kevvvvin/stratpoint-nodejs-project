export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  status: string;
  kycStatus: string;
  exp: number;
}

export interface RequestError {
  field: string | number;
  message: string;
}
