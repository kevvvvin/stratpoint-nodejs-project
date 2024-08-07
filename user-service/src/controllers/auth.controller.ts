import { Request, Response } from "express";
import { RegisterRequestBody, LoginRequestBody } from "../types/auth.types";
import validator from "../utils/validator";
import logger from "../utils/logger";
import { AuthService } from "../services/auth.service";

const register = async (req: Request<RegisterRequestBody> , res: Response): Promise<Response> => {
    try {
        const { error } = validator.validateUser(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
    
        const result = await AuthService.register(req.body);
    
        return res.status(201).json(result);
      } catch (error) {
        logger.error('Error in user registration:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }    
}

const login = async (req: Request<LoginRequestBody>, res: Response): Promise<Response> => {
    try {
        const { error } = validator.validateLogin(req.body);
        if (error) {
         return res.status(400).json({ error: error.details[0].message });
        }

        const result = await AuthService.login(req.body);
    
        return res.status(200).json(result);
      } catch (error) {
        logger.error('Error in user login:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

const AuthController = {
    register,
    login
}

export default AuthController;