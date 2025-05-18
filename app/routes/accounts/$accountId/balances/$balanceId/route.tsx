import {
  ActionFunctionArgs,
  Form,
  Link,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/route";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const { accountId, balanceId } = params;

  if (!accountId || !balanceId) {
    throw new Response("Missing Required URL Params", { status: 404 });
  }

  const balance = await prisma.balanceSnapshot.findFirst({
    where: {
      account: {
        userId,
      },
      id: balanceId,
      accountId,
    },
  });

  if (!balance) {
    throw new Response("Record not found", { status: 404 });
  }

  return {
    balance,
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const { accountId, balanceId } = params;

  if (!accountId || !balanceId) {
    throw new Response("Missing Required URL Params", { status: 404 });
  }

  await prisma.balanceSnapshot.delete({
    where: {
      id: balanceId,
      accountId,
      account: {
        userId,
      },
    },
  });

  return redirect(`/accounts/${accountId}`);
};

export default function BalanceDetailRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <h4>Balance Snapshot from {loaderData.balance.date}</h4>
      <p>Amount: {formatCurrency(loaderData.balance.amount)}</p>
      <div>
        <h5>Actions</h5>
        <Link to="edit">Edit</Link>
        <div style={{ paddingTop: 20 }}>
          <Form method="post">
            <button type="submit" name="intent" value="delete">
              Delete
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
