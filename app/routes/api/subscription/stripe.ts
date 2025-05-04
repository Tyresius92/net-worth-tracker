import { ActionFunction } from "react-router";
import Stripe from "stripe";

import { stripe } from "~/stripe.server";

const handleAccountCreated = (
  _account: Stripe.FinancialConnections.Account,
) => {
  return Response.json({ ok: true });
};

const handleAccountDeactivated = (
  _account: Stripe.FinancialConnections.Account,
) => {
  return Response.json({ ok: true });
};

export const action: ActionFunction = async ({ request }) => {
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({}, { status: 403 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({}, { status: 500 });
  }

  const eventData = await request.json();

  let event;

  try {
    event = stripe.webhooks.constructEvent(eventData, sig, webhookSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json(`Error: ${err.message}`, { status: 400 });
    } else {
      return Response.json(`Non-error thrown: ${typeof err}`);
    }
  }

  const object = event.data.object;
  const eventType = event.type;

  if (object.object === "financial_connections.account") {
    if (eventType === "financial_connections.account.created") {
      return handleAccountCreated(object);
    } else if (eventType === "financial_connections.account.deactivated") {
      return handleAccountDeactivated(object);
    } else {
      return Response.json(
        "Unknown event type for financial connection account",
        { status: 500 },
      );
    }
  }

  return Response.json({ ok: true });
};
