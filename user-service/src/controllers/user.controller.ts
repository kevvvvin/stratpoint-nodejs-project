import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UserResponseBody } from '../types/response.types';
import logger from '../utils/logger';
import { IUser } from '../types/schema.types';

const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const result: UserResponseBody[] = await UserService.getAllUsers();

    logger.info('Retrieved all users successfully', result);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId: string = req.params.id;
    const loggedInUser = req.user as IUser;

    const result: UserResponseBody = await UserService.getUserById(userId, loggedInUser);
    logger.info(`Retrieved user with id: ${userId} successfully`);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const UserController = {
  getAllUsers,
  getUserById,
};

export default UserController;
