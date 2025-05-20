import { LoaderFunctionArgs, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";
import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/route";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const balanceSnapshots = await prisma.balanceSnapshot.findMany({
    where: {
      accountId,
      account: {
        userId,
      },
    },
    orderBy: {
      dateTime: "asc",
    },
  });

  if (!balanceSnapshots) {
    return redirect("./..");
  }

  return { userId, balanceSnapshots };
};

export default function AccountDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Box>
      <Box>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBlockEnd: 16,
          }}
        >
          <Link to="balances/new">New Balance</Link>
          <Link to="balances/import">Import balances via CSV</Link>
        </div>
        <Table caption="Balances">
          <Table.Head>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Date</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Amount Raw</Table.ColumnHeader>
          </Table.Head>
          <Table.Body>
            {loaderData.balanceSnapshots.map((snapshot) => (
              <Table.Row key={snapshot.id}>
                <Table.Cell>
                  <Link to={`balances/${snapshot.id}`}>{snapshot.id}</Link>
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
