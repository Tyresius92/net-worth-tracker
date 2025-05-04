import { useEffect } from "react";
import { ActionFunctionArgs, Form, LoaderFunctionArgs } from "react-router";

import { prisma } from "~/db.server";
import { getStripeCustomerByUserId } from "~/models/stripeCustomer.server";
import { requireUser } from "~/session.server";
import { stripeClient } from "~/stripe.client";
import { stripe } from "~/stripe.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  return {
    user,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  let maybeStripeCustomer = await getStripeCustomerByUserId(user.id);

  if (!maybeStripeCustomer) {
    const customer = await stripe.customers.create({
      email: user.email,
    });

    maybeStripeCustomer = await prisma.stripeCustomer.create({
      data: {
        userId: user.id,
        customerId: customer.id,
      },
    });
  }

  const session = await stripe.financialConnections.sessions.create({
    account_holder: {
      type: "customer",
      customer: maybeStripeCustomer?.customerId,
    },
    permissions: ["balances"],
    filters: {
      countries: ["US"],
    },
    // prefetch: ["balances"],
  });

  return {
    user,
    secret: session.client_secret,
  };
};

export default function LinkedAccountsIndex({
  actionData,
}: Route.ComponentProps) {
  useEffect(() => {
    const doTheThing = async () => {
      if (actionData?.secret) {
        const financialConnectionsSessionResult =
          await stripeClient!.collectFinancialConnectionsAccounts({
            clientSecret: actionData.secret,
          });

        console.log("asdf result", {
          financialConnectionsSessionResult,
        });
      }
    };

    if (actionData?.secret) {
      doTheThing();
    }
  }, [actionData]);

  return (
    <div>
      <h2>Linked Accounts</h2>
      <div>
        <div>Link a new account</div>
        <div>
          <Form method="post" action=".?index">
            <button type="submit">Do it</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
