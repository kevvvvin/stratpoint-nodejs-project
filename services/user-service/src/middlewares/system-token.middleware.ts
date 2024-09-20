import jwt from 'jsonwebtoken';
import { envConfig } from '../configs';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';
import { logger } from '../utils';

/*
  TODO: For better practice, store tokens in a cache or storage solution like Redis.
  The current implementation would lead to issues in a multi-instance setup.
*/

let serviceToken: string | null = null;
let tokenExpiry: number | null = null;

export const fetchServiceToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);

    if (!serviceToken || (tokenExpiry && currentTime >= tokenExpiry)) {
      const generateTokenResponse = await fetch(
        `http://${req.get('host')}/api/auth/generate-service-token`,
        {
          method: 'POST',
          headers: {
            'x-internal-service-secret': envConfig.serviceSecret as string,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceName: 'user-service' }),
        },
      );
      if (generateTokenResponse.status !== 201)
        throw new Error('Failed to generate token for internal service communication.');
      serviceToken = (await generateTokenResponse.json()).result;
      if (!serviceToken) throw new Error('Generated token was invalid.');
      const decoded = jwt.decode(serviceToken) as JwtPayload;
      tokenExpiry = decoded.exp;

      logger.info(`Generated a service token for internal service communication`);
    }

    res.locals.serviceToken = serviceToken;
    next();
  } catch (error) {
    next(error);
  }
};
