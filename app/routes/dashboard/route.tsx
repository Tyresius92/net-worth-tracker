import { LoaderFunctionArgs } from "react-router";

import { BalanceChart } from "~/components/BalanceChart/BalanceChart";
import { Box } from "~/components/Box/Box";
import { Divider } from "~/components/Divider/Divider";
import { Grid } from "~/components/Grid/Grid";
import { Heading } from "~/components/Heading/Heading";
import { NavLink } from "~/components/NavLink/NavLink";
import { Table } from "~/components/Table/Table";
import { Text } from "~/components/Text/Text";
import { prisma } from "~/db.server";
import { getLatestBalancesAsOfDate } from "~/models/user.server";
import { requireUser } from "~/session.server";
import { getAccountDisplayName } from "~/utils/accountUtils";
import {
  fillDailyBalanceDayData,
  formatDate as toISODate,
} from "~/utils/balanceUtils";
import { formatCurrency } from "~/utils/currencyUtils";
import { formatDate, getDateNDaysAgo } from "~/utils/dateUtils";
import { getUserNetWorth } from "~/utils/netWorthUtils.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: user.id,
    },
    include: {
      accounts: {
        where: {
          closedAt: null,
        },
        include: {
          balanceSnapshots: {
            take: 1,
            orderBy: {
              dateTime: "desc",
            },
          },
          plaidAccount: {
            select: {
              id: true,
              name: true,
              officialName: true,
              mask: true,
              plaidItem: {
                select: {
                  id: true,
                  institutionName: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const dataFromThirtyDaysAgo = await getLatestBalancesAsOfDate(
    user.id,
    getDateNDaysAgo(30),
  );

  const dataFromFirstDayOfTheYear = await getLatestBalancesAsOfDate(
    user.id,
    new Date(new Date().getFullYear(), 0, 1),
  );

  const dataFromOneYearAgo = await getLatestBalancesAsOfDate(
    user.id,
    getDateNDaysAgo(365),
  );

  const accounts = await prisma.account.findMany({
    where: {
      userId: user.id,
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

  const getCutoffDate = (rangeSlug: string | undefined): string | null => {
    if (rangeSlug === "thirty_days") {return toISODate(getDateNDaysAgo(30));}
    if (rangeSlug === "this_year")
      {return toISODate(new Date(new Date().getFullYear(), 0, 1));}
    if (rangeSlug === "twelve_months") {return toISODate(getDateNDaysAgo(365));}
    return null;
  };

  const cutoff = getCutoffDate(params.rangeSlug);
  const filteredBalanceDays = cutoff
    ? balanceDays.filter((b) => b.date >= cutoff)
    : balanceDays;

  return {
    accounts: userData.accounts.map((account) => ({
      id: account.id,
      name: getAccountDisplayName(account),
      balance: account.balanceSnapshots?.[0]?.amount,
      lastSynced: account.balanceSnapshots?.[0]?.dateTime,
      institution:
        account.plaidAccount?.plaidItem?.institutionName ?? "Staff-reported",
      last4: account.plaidAccount?.mask,
      isStale: account.balanceSnapshots?.[0]?.dateTime
        ? Date.now() -
            new Date(account.balanceSnapshots[0].dateTime).getTime() >
          60 * 24 * 60 * 60 * 1000
        : false,
    })),
    netWorth: getUserNetWorth(userData.accounts),
    netWorthFromThirtyDaysAgo: getUserNetWorth(dataFromThirtyDaysAgo.accounts),
    netWorthFromStartOfYear: getUserNetWorth(
      dataFromFirstDayOfTheYear.accounts,
    ),
    netWorthFromOneYearAgo: getUserNetWorth(dataFromOneYearAgo.accounts),
    balances: filteredBalanceDays,
  };
};

export default function AuthenticatedUserFrontPage({
  loaderData,
}: Route.ComponentProps) {
  const {
    netWorth,
    netWorthFromThirtyDaysAgo,
    netWorthFromOneYearAgo,
    netWorthFromStartOfYear,
    balances,
    accounts,
  } = loaderData;

  const thirtyDayChange = netWorth - netWorthFromThirtyDaysAgo;
  const thisYearChange = netWorth - netWorthFromStartOfYear;
  const oneYearChange = netWorth - netWorthFromOneYearAgo;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" xsPt={16} xsPb={8}>
        <Text variant="byline">Section A · Net worth record</Text>
        <Text variant="byline">Reported from the record</Text>
      </Box>
      <Divider />
      <Box display="flex" justifyContent="center" xsPy={32}>
        <Heading level={1} fontSize={72}>
          Net worth: {formatCurrency(netWorth)}
        </Heading>
      </Box>
      <Divider />
      <Box
        xsColumns={1}
        lColumns={3}
        columnRule={{ color: "sand-7" }}
        xsPy={24}
      >
        <Box xsPx={16}>
          <Heading level={2}>
            {thirtyDayChange < 0 ? "Down" : "Up"}{" "}
            {formatCurrency(thirtyDayChange)}
          </Heading>
          <Text>over the last 30 days</Text>
        </Box>
        <Box xsPx={16}>
          <Heading level={2}>
            {thisYearChange < 0 ? "Down" : "Up"}{" "}
            {formatCurrency(thisYearChange)}
          </Heading>
          <Text>since the beginning of this year</Text>
        </Box>
        <Box xsPx={16}>
          <Heading level={2}>
            {oneYearChange < 0 ? "Down" : "Up"} {formatCurrency(oneYearChange)}
          </Heading>
          <Text>over the last year</Text>
        </Box>
      </Box>
      <Divider />
      <Box xsPy={32}>
        <Grid gap={32}>
          <Grid.Item l={7}>
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Heading level={3} fontSize={20}>
                  Fig. 1 · Net worth
                </Heading>
                <Box display="flex">
                  <NavLink to="/dashboard/thirty_days" preventScrollReset>
                    30 days
                  </NavLink>
                  <NavLink to="/dashboard/this_year" preventScrollReset>
                    This year
                  </NavLink>
                  <NavLink to="/dashboard/twelve_months" preventScrollReset>
                    12 months
                  </NavLink>
                  <NavLink to="/dashboard" preventScrollReset end>
                    Full record
                  </NavLink>
                </Box>
              </Box>
              <BalanceChart balances={balances} title="Net worth history" />
            </Box>
          </Grid.Item>
          <Grid.Item l={5}>
            <Box>
              <Table caption="Sources of record">
                <Table.Body>
                  {accounts.map((account) => (
                    <Table.Row key={account.id}>
                      <Table.Cell>
                        <Text>{account.name}</Text>
                        <Text>
                          {account.institution}
                          {account.last4 ? ` · ${account.last4}` : ""}
                        </Text>
                      </Table.Cell>
                      <Table.Cell align="end">
                        <Text>{formatCurrency(account.balance)}</Text>
                        <Text variant="caption">
                          {formatDate(new Date(account.lastSynced))}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Box>
          </Grid.Item>
        </Grid>
      </Box>
    </Box>
  );
}
