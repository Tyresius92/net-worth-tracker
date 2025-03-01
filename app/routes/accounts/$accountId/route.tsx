import { Link, LoaderFunctionArgs } from "react-router";

import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const account = await prisma.account.findFirst({
    select: {
      id: true,
      nickName: true,
      officialName: true,
      plaidAccountId: true,
      balances: {
        select: {
          id: true,
          amount: true,
          date: true,
        },
      },
    },
    where: {
      id: accountId,
      userId,
    },
  });

  return { account };
};

export default function AccountDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  const numberFormatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const format = (cents: number) => numberFormatter.format(cents / 100);

  return (
    <div>
      <div
        style={{
          paddingBlock: 50,
        }}
      >
        <h3>{loaderData.account?.nickName}</h3>
      </div>
      <div
        style={{
          paddingBlockEnd: 50,
        }}
      >
        <Link to="balances/new">Add a manual balance</Link>
      </div>
      <div>
        <Table caption="Account balances">
          <Table.Head>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Date</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
          </Table.Head>
          <Table.Body>
            {loaderData.account?.balances.map((balance) => (
              <Table.Row key={balance.id}>
                <Table.Cell>{balance.id}</Table.Cell>
                <Table.Cell>{balance.date}</Table.Cell>
                <Table.Cell>{format(balance.amount)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
