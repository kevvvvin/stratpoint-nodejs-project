import { CustomError, MongooseError, JwtError } from '../types/error.types';

// Type guard for MongooseError
export function isMongooseError(err: CustomError): err is MongooseError {
  return (
    (err as MongooseError).code !== undefined || 
    (err as MongooseError).errors !== undefined
  );
}

// Type guard for JwtError
export function isJwtError(err: CustomError): err is JwtError {
  return err.name === 'UnauthorizedError';
}

// // Type guard for RegistrationError
// export function isRegistrationError(err: CustomError): err is RegistrationError {
//     return err.name === 'RegistrationError';
// }

// // Type guard for LoginError
// export function isLoginError(err: CustomError): err is LoginError {
//     return err.name === 'LoginError';
// }
  

