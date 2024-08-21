import { Request, Response, NextFunction } from 'express';
import { StripeService } from '../services';
import {
  CustomerResponseDto,
  PaymentMethodRequestDto,
  PaymentMethodResponseDto,
} from '../dtos';
import { logger } from '../utils';
import { JwtPayload } from '../types';

export class StripeController {
  constructor(private stripeService: StripeService) {}

  async createCustomerId(
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

  async createPaymentMethod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = req.payload as JwtPayload;
      const paymentMethodDetails: PaymentMethodRequestDto = req.body;
      if (paymentMethodDetails.type !== 'card' /*|| !paymentMethodDetails.card*/) {
        const error = new Error('Invalid payment method details');
        return next(error);
      }

      const paymentMethod =
        await this.stripeService.createPaymentMethod(paymentMethodDetails);
      const customerId = await this.stripeService.getCustomerId(userDetails.email);
      await this.stripeService.attachPaymentMethodToCustomer(
        paymentMethod.id,
        customerId,
      );

      const message = 'Payment method created successfully';
      const response = new PaymentMethodResponseDto(message, paymentMethod);
      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}
