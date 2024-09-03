import jwt from 'jsonwebtoken';
import { envConfig } from '../configs';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';
import { logger } from '../utils';

let adminToken: string | null = null;
let tokenExpiry: number | null = null;

export const fetchAdminToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    if (!adminToken || (tokenExpiry && currentTime >= tokenExpiry)) {
      const generateTokenResponse = await fetch(
        `http://${envConfig.userService}:3001/api/auth/generate-admin-token/notification-service`,
        {
          method: 'POST',
          headers: {
            'x-internal-service': 'true',
          },
        },
      );
      if (generateTokenResponse.status !== 201)
        throw new Error('Failed to generate token for internal service comms.');
      adminToken = (await generateTokenResponse.json()).result;
      if (!adminToken) throw new Error('Generated token was invalid.');
      const decoded = jwt.decode(adminToken) as JwtPayload;
      tokenExpiry = decoded.exp;

      logger.info('Generated an admin token for internal service communication');
      req.adminToken = adminToken;
    } else {
      req.adminToken = adminToken;
    }
    next();
  } catch (error) {
    next(error);
  }
};
