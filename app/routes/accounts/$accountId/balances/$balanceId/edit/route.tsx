import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect } from "react-router";
import invariant from "tiny-invariant";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { getUserId, loginRedirect } from "~/session.server";
import { parseDate } from "~/utils/balanceUtils";

import type { Route } from "./+types/route";

export const loader = async ({ request, url, params }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);

  invariant(params.accountId && params.balanceId, "Missing required URL Param");
  const accountId = params.accountId;
  const balanceId = params.balanceId;

  const balance = await prisma.balanceSnapshot.findFirst({
    where: {
      id: balanceId,
      accountId,
      account: {
        userId,
      },
    },
  });

  if (!balance) {
    return redirect("/accounts");
  }

  return {
    balance,
  };
};

export const action = async ({ request, url, params }: ActionFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);

  invariant(params.accountId && params.balanceId, "Missing required URL Param");
  const accountId = params.accountId;
  const balanceId = params.balanceId;

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    include: {
      balanceSnapshots: true,
    },
  });

  if (!account) {
    return redirect("/accounts");
  }

  const formData = await request.formData();

  const amount = formData.get("amount");
  const dateTime = formData.get("dateTime");

  if (typeof amount !== "string" || isNaN(parseFloat(amount))) {
    return {
      errors: {
        amount: "Amount must be a valid number",
      },
    };
  }

  if (typeof dateTime !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
    return {
      errors: {
        dateTime: "Invalid Datetime",
      },
    };
  }

  await prisma.balanceSnapshot.update({
    where: {
      id: balanceId,
      accountId,
      account: {
        userId,
      },
    },
    data: {
      amount: parseFloat(amount) * 100,
      dateTime: parseDate(dateTime),
    },
  });

  return redirect(`/accounts/${accountId}`);
};

export default function BalanceEditRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <Form method="post">
        <TextInput
          label="Figure amount"
          type="number"
          name="amount"
          step={0.01}
          errorMessage={undefined}
          defaultValue={loaderData.balance.amount / 100}
        />
        <TextInput
          label="Figure date"
          type="date"
          name="dateTime"
          errorMessage={undefined}
          defaultValue={loaderData.balance.date}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </Box>
  );
}
