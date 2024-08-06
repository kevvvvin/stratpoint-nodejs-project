import { Request, Response } from "express";
import User from "../models/user.model";
import jwt from 'jsonwebtoken';
import config from "../config"
import validator from "../utils/validator";

interface RegisterRequestBody {
    email: string,
    password: string,
    firstName: string,
    lastName: string
}

interface LoginRequestBody {
    email: string,
    password: string
}

const register = async (req: Request<{}, {}, RegisterRequestBody> , res: Response): Promise<Response> => {
    try {
         const { error } = validator.validateUser(req.body);
         if (error) return res.status(400).json({ error: error.details[0].message });
    
        const { email, password, firstName, lastName } = req.body;
    
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });
    
        user = new User({ email, password, firstName, lastName });
        await user.save();
    
        const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1d' });
    
        return res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                email: user.email, 
                firstName: 
                user.firstName, 
                lastName: 
                user.lastName 
            } 
        });

      } catch (error) {
        // logger.error('Error in user registration:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }    
}

const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    try {
        const { error } = validator.validateLogin(req.body);
        if (error) {
          res.status(400).json({ error: error.details[0].message });
          return;
        }
    
        const { email, password } = req.body;
    
        const user = await User.findOne({ email });
        if (!user) {
          res.status(400).json({ error: 'Invalid email or password' });
          return;
        }
    
        const isMatch = await user.checkPassword(password);
        if (!isMatch) {
          res.status(400).json({ error: 'Invalid email or password' });
          return;
        }
    
        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    
        // Respond with the token and user info
        res.json({
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      } catch (error) {
        // logger.error('Error in user login:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}

const AuthController = {
    register,
    login
}

export default AuthController;