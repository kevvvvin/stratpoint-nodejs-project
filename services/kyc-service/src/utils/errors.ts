export class MongooseError extends Error {
  public code?: number;
  public errors: {
    [key: string]: {
      message: string;
    };
  };
  public keyValue?: {
    [key: string]: Record<string, string | number | boolean>;
  };

  constructor(
    message: string,
    errors: { [key: string]: { message: string } },
    code?: number,
    keyValue?: { [key: string]: Record<string, string | number | boolean> },
  ) {
    super(message);
    this.name = 'MongooseError';
    this.errors = errors;
    this.code = code;
    this.keyValue = keyValue;
  }
}

export class JwtError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JwtError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

interface RequestError {
  field: string | number;
  message: string;
}

export class RequestValidationError extends Error {
  errors: RequestError[];
  constructor(message: string, errors: RequestError[]) {
    super(message);
    this.name = 'RequestValidationError';
    this.errors = errors;
  }
}
