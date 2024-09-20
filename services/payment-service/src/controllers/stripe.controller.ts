import { Request, Response, NextFunction } from 'express';
import { StripeService } from '../services';
import {
  AttachPaymentRequestDto,
  CustomerResponseDto,
  DetachPaymentRequestDto,
  PaymentIntentRequestDto,
  PaymentIntentResponseDto,
  PaymentMethodRequestDto,
  PaymentMethodResponseDto,
  PayoutResponseDto,
  RetrievePaymentRequestDto,
} from '../dtos';
import { logger } from '../utils';
import { JwtPayload } from 'shared-common';

export class StripeController {
  constructor(private stripeService: StripeService) {}

  async createCustomerId(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = res.locals.payload as JwtPayload;

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
      const userDetails = res.locals.payload as JwtPayload;
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

  async getPaymentMethods(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const userDetails = res.locals.payload as JwtPayload;
      const customerId = await this.stripeService.getCustomerId(userDetails.email);

      const paymentMethods =
        await this.stripeService.listCustomerPaymentMethods(customerId);

      const message = 'Retrieved payment methods successfully';
      const response = new PaymentMethodResponseDto(message, paymentMethods);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async retrievePaymentMethod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const retrieveRequest: RetrievePaymentRequestDto = req.body;
      const result = await this.stripeService.retrievePaymentMethod(
        retrieveRequest.paymentMethodId,
      );

      const message = 'Retrieved payment method successfully';
      const response = new PaymentMethodResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async attachPaymentMethod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const attachPaymentRequest: AttachPaymentRequestDto = req.body;
      const result = await this.stripeService.attachPaymentMethodToCustomer(
        attachPaymentRequest.paymentMethodId,
        attachPaymentRequest.customerId,
      );

      const message = 'Payment method attached to customer successfully';
      const response = new PaymentMethodResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async detachPaymentMethod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const detachPaymentRequest: DetachPaymentRequestDto = req.body;
      const result = await this.stripeService.detachPaymentMethodFromCustomer(
        detachPaymentRequest.paymentMethodId,
      );

      const message = 'Payment method detached from customer successfully';
      const response = new PaymentMethodResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async createPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const paymentIntentRequest: PaymentIntentRequestDto = req.body;
      const result = await this.stripeService.createPaymentIntent(
        paymentIntentRequest.amount,
        paymentIntentRequest.currency,
        paymentIntentRequest.stripeCustomerId,
      );

      const message = 'Payment intent created successfully';
      const response = new PaymentIntentResponseDto(message, result);

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async confirmPaymentIntent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;
      const result = await this.stripeService.confirmPaymentIntent(
        paymentIntentId,
        paymentMethodId,
      );

      const message = 'Payment intent confirmed successfully';
      const response = new PaymentIntentResponseDto(message, result);

      logger.info(response);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async createPayout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { amount, customerId } = req.body;
      const result = await this.stripeService.createPayout(amount, customerId);

      const message = 'Payout created successfully';
      const response = new PayoutResponseDto(message, result);

      logger.info(response);
      return res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}
