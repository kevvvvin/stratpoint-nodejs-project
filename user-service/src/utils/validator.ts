import Joi, { ValidationResult } from 'joi';
import { RegisterRequestBody, LoginRequestBody } from '../types/request.types';

const validateUser = (
  user: RegisterRequestBody,
): ValidationResult<RegisterRequestBody> => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
  });
  return schema.validate(user);
};

const validateLogin = (data: LoginRequestBody): ValidationResult<LoginRequestBody> => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

const validateId = (id: string): ValidationResult => {
  return Joi.string().required().validate(id);
};

const validateEmail = (email: string): ValidationResult => {
  return Joi.string().email().required().validate(email);
};

const validator = {
  validateUser,
  validateLogin,
  validateId,
  validateEmail,
};

export default validator;
