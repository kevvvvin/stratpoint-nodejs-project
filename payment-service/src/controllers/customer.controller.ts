import { Request, Response, NextFunction } from 'express';
import { StripeService } from '../services';
import { CustomerResponseDto } from '../dtos';
import { logger } from '../utils';
import { JwtPayload } from '../types';

export class CustomerController {
  constructor(private stripeService: StripeService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = req.payload as JwtPayload;
      const result = await this.stripeService.createCustomer(userDetails);
      const message = 'Customer created successfully';
      const response = new CustomerResponseDto(message, result);

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}
