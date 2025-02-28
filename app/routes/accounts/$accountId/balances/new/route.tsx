import {
  ActionFunctionArgs,
  data,
  Form,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const userAccounts = await prisma.account.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      nickName: true,
    },
  });

  return {
    userAccounts,
  };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const formData = await request.formData();
  const balance = formData.get("balance");
  const date = formData.get("date");

  console.log("asdf actionData", {
    balance,
    date,
    typeDate: typeof date,
  });

  if (typeof balance !== "string") {
    return data(
      { errors: { date: null, balance: "Balance is required" } },
      { status: 400 },
    );
  }

  if (typeof date !== "string") {
    return data(
      { errors: { date: "Date is required", balance: null } },
      { status: 400 },
    );
  }

  const balanceNum = parseFloat(balance);

  const balanceCents = Math.floor(balanceNum * 100);

  await prisma.accountBalance.create({
    data: {
      accountId,
      date: new Date(new Date(date).setUTCHours(0, 0, 0, 0)),
      amount: balanceCents,
    },
  });

  return redirect("..");
};

export default function NewBalanceRoute(_props: Route.ComponentProps) {
  return (
    <div>
      <h2>New Balance</h2>
      <Form method="post">
        <TextInput
          name="balance"
          label="Account balance"
          type="number"
          step={0.01}
        />
        <TextInput name="date" label="Date" type="date" />
        <button type="submit">Save</button>
      </Form>
    </div>
  );
}
