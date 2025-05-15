import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
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

  return {};
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
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

  await prisma.balanceSnapshot.create({
    data: {
      accountId,
      amount: parseFloat(amount) * 100,
      dateTime: new Date(year, month - 1, day),
    },
  });

  return redirect(`/accounts/${accountId}`);
};

export default function NewBalanceRoute(_routeProps: Route.ComponentProps) {
  return (
    <div>
      <Form method="post">
        <TextInput
          label="Snapshot Amount"
          type="number"
          name="amount"
          step={0.01}
          errorMessage={undefined}
        />
        <TextInput
          label="Snapshot Date"
          type="date"
          name="dateTime"
          errorMessage={undefined}
        />
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}
