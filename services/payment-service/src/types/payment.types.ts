export interface cardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface MockPayoutResult {
  id: string;
  object: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
}
