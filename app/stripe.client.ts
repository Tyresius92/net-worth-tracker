import { loadStripe } from "@stripe/stripe-js";

export const stripeClient = await loadStripe(window.ENV.STRIPE_PUBLIC_KEY);
