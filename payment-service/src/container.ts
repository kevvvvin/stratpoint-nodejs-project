import { StripeService } from './services';
import { CustomerController } from './controllers';
import { envConfig } from './configs';
import Stripe from 'stripe';

const stripe = new Stripe(envConfig.stripeSecret);

const stripeService = new StripeService(stripe);
const customerController = new CustomerController(stripeService);

export { customerController };
