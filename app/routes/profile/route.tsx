import { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";
import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      accounts: {
        where: {
          closedAt: null,
        },
        include: {
          plaidAccount: {
            select: {
              name: true,
              officialName: true,
            },
          },
          balanceSnapshots: {
            take: 1,
            orderBy: {
              dateTime: "desc",
            },
          },
        },
      },
    },
  });

  return {
    user,
    netWorth: user.accounts.reduce((accumulator, account) => {
      const snap = account.balanceSnapshots[0];

      if (!snap) {
        return accumulator;
      }

      return accumulator + snap.amount;
    }, 0),
  };
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <h1>{loaderData.user.fullName}&apos;s Profile</h1>

      {loaderData.user.twoFactorEnabled ? (
        <Box>
          <h2>2FA is enabled</h2>
        </Box>
      ) : (
        <Box>
          <h2>2FA not enabled</h2>
          <p>You do not have two factor authentication enabled.</p>
          <p>2FA is required to pull account information in with Plaid.</p>
          <Link to="./enable_mfa">Set up 2FA</Link>
        </Box>
      )}
      <h2>Your Net Worth: {formatCurrency(loaderData.netWorth)}</h2>
      <Table caption="Net worth breakdown">
        <Table.Head>
          <Table.ColumnHeader>Account ID</Table.ColumnHeader>
          <Table.ColumnHeader>Account Name</Table.ColumnHeader>
          <Table.ColumnHeader>Latest Balance</Table.ColumnHeader>
          <Table.ColumnHeader>Latest Balance Date</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          {[...loaderData.user.accounts]
            .sort((a, b) => {
              const aName =
                a.customName ??
                a.plaidAccount?.name ??
                a.plaidAccount?.officialName ??
                "[Unnamed Account]";
              const bName =
                b.customName ??
                b.plaidAccount?.name ??
                b.plaidAccount?.officialName ??
                "[Unnamed Account]";

              return aName.localeCompare(bName);
            })
            .map((account) => (
              <Table.Row key={account.id}>
                <Table.Cell>
                  <Link to={`/accounts/${account.id}`}>{account.id}</Link>
                </Table.Cell>
                <Table.Cell>
                  {account.customName ??
                    account.plaidAccount?.name ??
                    account.plaidAccount?.officialName ??
                    "[Unnamed Account]"}
                </Table.Cell>
                <Table.Cell>{account.balanceSnapshots[0]?.amount}</Table.Cell>
                <Table.Cell>{account.balanceSnapshots[0]?.date}</Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </Box>
  );
}
