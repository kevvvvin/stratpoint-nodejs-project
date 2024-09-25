export interface PaymentMethodDetails {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentIntentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string | null;
  paymentMethod: string[];
}

export interface PayoutDetails {
  id: string;
  object: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
}
