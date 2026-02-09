import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { BalanceChart } from "~/components/BalanceChart/BalanceChart";
import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { getLatestBalancesAsOfDate } from "~/models/user.server";
import { getUser } from "~/session.server";
import { fillDailyBalanceDayData } from "~/utils/balanceUtils";
import { formatCurrency } from "~/utils/currencyUtils";
import { getDateNDaysAgo } from "~/utils/dateUtils";
import { getUserNetWorth } from "~/utils/netWorthUtils.server";

import type { Route } from "./+types/_index";

export const meta: MetaFunction = () => [{ title: "Net Worth Tracker" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  if (!user) {
    return {
      user,
      netWorth: 0,
      netWorthFromThirtyDaysAgo: 0,
      netWorthFromStartOfYear: 0,
      netWorthFromOneYearAgo: 0,
    };
  }

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

  return {
    user,
    netWorth: getUserNetWorth(userData.accounts),
    netWorthFromThirtyDaysAgo: getUserNetWorth(dataFromThirtyDaysAgo.accounts),
    netWorthFromStartOfYear: getUserNetWorth(
      dataFromFirstDayOfTheYear.accounts,
    ),
    netWorthFromOneYearAgo: getUserNetWorth(dataFromOneYearAgo.accounts),
    balances: balanceDays,
  };
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const {
    user,
    netWorth,
    netWorthFromThirtyDaysAgo,
    netWorthFromOneYearAgo,
    netWorthFromStartOfYear,
  } = loaderData;

  const thirtyDayChange = netWorth - netWorthFromThirtyDaysAgo;
  const thisYearChange = netWorth - netWorthFromStartOfYear;
  const oneYearChange = netWorth - netWorthFromOneYearAgo;

  return (
    <div
      style={{
        minHeight: "100%",
      }}
    >
      <Box>
        {user ? (
          <Box>
            <h1 style={{ textTransform: "uppercase" }}>
              Your net worth is {formatCurrency(netWorth)}
            </h1>

            {thirtyDayChange !== 0 ? (
              <h2>
                {thirtyDayChange > 0 ? "Up" : "Down"}{" "}
                {formatCurrency(thirtyDayChange, { includeCents: false })} over
                the last 30 days
              </h2>
            ) : null}

            {thisYearChange !== 0 ? (
              <h2>
                {thisYearChange > 0 ? "Up" : "Down"}{" "}
                {formatCurrency(thisYearChange, { includeCents: false })} since
                the beginning of this year
              </h2>
            ) : null}

            {oneYearChange !== 0 ? (
              <h2>
                {oneYearChange > 0 ? "Up" : "Down"}{" "}
                {formatCurrency(oneYearChange, { includeCents: false })} over
                the last year
              </h2>
            ) : null}

            <BalanceChart balances={loaderData.balances} />
          </Box>
        ) : null}
      </Box>
    </div>
  );
}
