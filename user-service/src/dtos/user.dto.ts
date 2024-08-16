import { AuthResult, IUser, UserResult } from '../types';

export class UserResponseDto {
  message: string;
  result: UserResult | UserResult[];

  constructor(message: string, result: UserResult | UserResult[]) {
    this.message = message;
    this.result = result;
  }
}

export class AuthResponseDto {
  message: string;
  result: AuthResult;

  constructor(message: string, result: AuthResult) {
    this.message = message;
    this.result = result;
  }
}

export class RegisterRequestDto
  implements Pick<IUser, 'email' | 'password' | 'firstName' | 'lastName'>
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;

  constructor(email: string, password: string, firstName: string, lastName: string) {
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export class LoginRequestDto implements Pick<IUser, 'email' | 'password'> {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
