import { IUser } from './';

type UserDetails = Pick<
  IUser,
  '_id' | 'email' | 'firstName' | 'lastName' | 'status' | 'kycStatus' | 'isEmailVerified'
> & { roles: string[] };

export interface AuthResult {
  token: string;
  user: UserDetails;
}

export interface UserResult {
  user: UserDetails | UserDetails[];
}
