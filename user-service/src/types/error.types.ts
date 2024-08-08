export interface MongooseError extends Error {
  errors: {
    [key: string]: {
      message: string;
    };
  };
  code?: number;
  keyValue?: {
    [key: string]: Record<string, string | number | boolean>;
  };
}

export interface JwtError extends Error {
  name: string;
}

// export interface RegistrationError extends Error {
//     name: string;
// }

// export interface LoginError extends Error {
//     name: string;
// }

export type CustomError = MongooseError | JwtError;
