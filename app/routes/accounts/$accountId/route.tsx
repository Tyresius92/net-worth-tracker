import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Flex } from "~/components/Flex/Flex";
import { Link } from "~/components/Link/Link";
import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { fillDailyBalanceDayData } from "~/utils/balanceUtils";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/route";
import { AccountChart } from "./chart";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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
      balanceSnapshots: {
        orderBy: {
          dateTime: "desc",
        },
      },
    },
  });

  if (!account) {
    return redirect("./..");
  }

  return {
    userId,
    account,
    balances: fillDailyBalanceDayData([...account.balanceSnapshots].reverse()),
  };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const formData = await request.formData();

  const intent = formData.get("intent");
  if (intent === "close_account") {
    const now = new Date();
    await prisma.account.update({
      where: {
        id: accountId,
        userId: userId,
      },
      data: {
        closedAt: now,
      },
    });

    await prisma.balanceSnapshot.create({
      data: {
        accountId,
        amount: 0,
        dateTime: now,
      },
    });
  }

  return {};
};

export default function AccountDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Box>
      <Box>
        <Flex flexDirection="row" gap={8} mb={16}>
          <Box>
            <Link to="edit">Edit Account</Link>
          </Box>
          <Box>
            <Link to="balances/new">New Balance</Link>
          </Box>
          <Box>
            <Link to="balances/import">Import balances via CSV</Link>
          </Box>
          <Box>
            <Form method="post">
              <Button name="intent" value="close_account" type="submit">
                Mark account as closed
              </Button>
            </Form>
          </Box>
        </Flex>

        <AccountChart balances={loaderData.balances} />

        <Table caption="Balances">
          <Table.Head>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Date</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Amount Raw</Table.ColumnHeader>
          </Table.Head>
          <Table.Body>
            {loaderData.account.balanceSnapshots.map((snapshot) => (
              <Table.Row key={snapshot.id}>
                <Table.Cell>
                  <Link to={`balances/${snapshot.id}`}>
                    {snapshot.id.slice(15)}
                  </Link>
                </Table.Cell>
                <Table.Cell>{snapshot.date}</Table.Cell>
                <Table.Cell>{formatCurrency(snapshot.amount)}</Table.Cell>
                <Table.Cell>{snapshot.amount}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Box>
    </Box>
  );
}
