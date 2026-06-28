import type {
  ActionFunctionArgs,
  LoaderFunctionArgs} from "react-router";
import {
  Form,
  redirect,
} from "react-router";
import invariant from "tiny-invariant";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { getUserId, loginRedirect } from "~/session.server";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/route";

export const loader = async ({ request, url, params }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);

  const { accountId, balanceId } = params;
  invariant(accountId && balanceId, "Missing Required URL Params");

  const balance = await prisma.balanceSnapshot.findFirst({
    where: {
      account: {
        userId,
      },
      id: balanceId,
      accountId,
    },
  });

  invariant(balance, "Record not found");

  return {
    balance,
  };
};

export const action = async ({ request, url, params }: ActionFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);

  const { accountId, balanceId } = params;
  invariant(accountId && balanceId, "Missing Required URL Params");

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
    <Box>
      <h4>Figure from {loaderData.balance.date}</h4>
      <p>Amount: {formatCurrency(loaderData.balance.amount)}</p>
      <Box>
        <h5>Actions</h5>
        <Link to="edit">Edit</Link>
        <Box xsPt={20}>
          <Form method="post">
            <Button type="submit" name="intent" value="delete">
              Delete
            </Button>
          </Form>
        </Box>
      </Box>
    </Box>
  );
}
