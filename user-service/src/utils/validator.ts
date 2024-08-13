import Joi, { ValidationResult } from 'joi';
import { LoginRequestBody, RegisterRequestBody } from '../types/user.types';
import { KycSubmissionBody } from '../types/kyc.types';

export const validateUser = (
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

export const validateLogin = (
  data: LoginRequestBody,
): ValidationResult<LoginRequestBody> => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

export const validateKyc = (
  data: KycSubmissionBody,
): ValidationResult<KycSubmissionBody> => {
  const schema = Joi.object({
    idType: Joi.string().required(),
    idNumber: Joi.string().required(),
    idExpiration: Joi.date().required(),
  });
  return schema.validate(data);
};

export const validateId = (id: string): ValidationResult => {
  return Joi.string().required().validate(id);
};

export const validateEmail = (email: string): ValidationResult => {
  return Joi.string().email().required().validate(email);
};
