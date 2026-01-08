import { LoaderFunctionArgs } from "react-router";

import { BalanceChart } from "~/components/BalanceChart/BalanceChart";
import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";
import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { getAccountDisplayName } from "~/utils/accountUtils";
import { fillDailyBalanceDayData } from "~/utils/balanceUtils";
import { formatCurrency } from "~/utils/currencyUtils";
import { getUserNetWorth } from "~/utils/netWorthUtils.server";

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

  const accounts = await prisma.account.findMany({
    where: {
      userId,
    },
    include: {
      balanceSnapshots: {
        select: {
          id: true,
          amount: true,
          date: true,
        },
        orderBy: {
          dateTime: "asc",
        },
      },
    },
  });

  const snapshots = accounts.flatMap((account) =>
    fillDailyBalanceDayData(account.balanceSnapshots),
  );

  const dailyAmounts = snapshots.reduce<Record<string, number>>((acc, curr) => {
    if (typeof acc[curr.date] !== "number") {
      acc[curr.date] = 0;
    }

    acc[curr.date] += curr.amount;

    return acc;
  }, {});

  const balanceDays = Object.entries(dailyAmounts)
    .map(([date, amount]) => ({
      date,
      amount,
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    user,
    netWorth: getUserNetWorth(user.accounts),
    balances: balanceDays,
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

      <h2>Net worth history</h2>
      <BalanceChart balances={loaderData.balances} />

      <h2>Net worth breakdown</h2>
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
              const aName = getAccountDisplayName(a);
              const bName = getAccountDisplayName(b);

              return aName.localeCompare(bName);
            })
            .map((account) => (
              <Table.Row key={account.id}>
                <Table.Cell>
                  <Link to={`/accounts/${account.id}`}>{account.id}</Link>
                </Table.Cell>
                <Table.Cell>{getAccountDisplayName(account)}</Table.Cell>
                <Table.Cell>
                  {formatCurrency(account.balanceSnapshots[0]?.amount ?? 0)}
                </Table.Cell>
                <Table.Cell>{account.balanceSnapshots[0]?.date}</Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </Box>
  );
}
