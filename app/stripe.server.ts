import Stripe from "stripe";

let _stripe: Stripe | null;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const getStripe = (): Stripe => {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // ...
    });
  }
  return _stripe;
};
