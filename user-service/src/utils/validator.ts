import Joi from 'joi';
import { RegisterRequestBody, LoginRequestBody } from '../types/auth.types';

const validateUser = (user: RegisterRequestBody) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required()
    });
    return schema.validate(user);
}

const validateLogin = (data: LoginRequestBody) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(data);
}

const validateId = (id: string) => {
    return Joi.string().required().validate(id);
}

const validateEmail = (email: string) => {
    return Joi.string().email().required().validate(email);
}

const validator = {
    validateUser,
    validateLogin,
    validateId,
    validateEmail
};

export default validator;