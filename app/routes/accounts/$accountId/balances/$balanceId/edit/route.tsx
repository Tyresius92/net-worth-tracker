import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  const balanceId = params.balanceId;
  if (!accountId || !balanceId) {
    throw new Response("Missing required URL Param", { status: 404 });
  }

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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  const balanceId = params.balanceId;
  if (!accountId || !balanceId) {
    throw new Response("Missing required URL Param", { status: 404 });
  }

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

  if (typeof amount !== "string") {
    return {
      errors: {
        amount: "Amount must be a string",
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

  const [year, month, day] = dateTime
    .split("-")
    .map((segment) => parseInt(segment, 10));

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
      dateTime: new Date(year, month - 1, day),
    },
  });

  return redirect(`/accounts/${accountId}`);
};

export default function BalanceEditRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <Form method="post">
        <TextInput
          label="Snapshot Amount"
          type="number"
          name="amount"
          step={0.01}
          errorMessage={undefined}
          defaultValue={loaderData.balance.amount / 100}
        />
        <TextInput
          label="Snapshot Date"
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
