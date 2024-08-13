import {
  CustomError,
  MongooseError,
  JwtError,
  NotFoundError,
} from '../types/error.types';

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

export function isNotFoundError(err: CustomError): err is NotFoundError {
  return err.name === 'NotFoundError';
}
