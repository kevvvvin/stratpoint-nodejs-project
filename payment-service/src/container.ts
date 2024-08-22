import { StripeService } from './services';
import { StripeController } from './controllers';
import { envConfig } from './configs';
import Stripe from 'stripe';

const stripe = new Stripe(envConfig.stripeSecret);

const stripeService = new StripeService(stripe);
const stripeController = new StripeController(stripeService);

export { stripeController };
