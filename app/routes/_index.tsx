import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { BalanceChart } from "~/components/BalanceChart/BalanceChart";
import { Box } from "~/components/Box/Box";
import { Divider } from "~/components/Divider/Divider";
import { Flex } from "~/components/Flex/Flex";
import { prisma } from "~/db.server";
import { getLatestBalancesAsOfDate } from "~/models/user.server";
import { getUser } from "~/session.server";
import { fillDailyBalanceDayData } from "~/utils/balanceUtils";
import { formatCurrency } from "~/utils/currencyUtils";
import { getDateNDaysAgo } from "~/utils/dateUtils";
import { getUserNetWorth } from "~/utils/netWorthUtils.server";

import type { Route } from "./+types/_index";
import styles from "./_index.module.css";

export const meta: MetaFunction = () => [{ title: "The Ledger" }];

function generateDemoBalances() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 24);

  const totalMs = today.getTime() - startDate.getTime();
  const balances: { date: string; amount: number }[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    const elapsed = current.getTime() - startDate.getTime();
    const progress = elapsed / totalMs;
    const weekIndex = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));

    const base = 8_500_000 + progress * 8_000_000;
    const wave1 = Math.sin((weekIndex * 2 * Math.PI) / 26) * 300_000;
    const wave2 = Math.sin((weekIndex * 2 * Math.PI) / 52) * 600_000;
    const wave3 = Math.sin((weekIndex * 2 * Math.PI) / 13) * 150_000;

    balances.push({
      date: current.toISOString().split("T")[0],
      amount: Math.round(base + wave1 + wave2 + wave3),
    });

    current.setDate(current.getDate() + 7);
  }

  return balances;
}

function findDemoAmountAtDate(
  balances: { date: string; amount: number }[],
  target: Date,
) {
  const targetStr = target.toISOString().split("T")[0];
  let closest = balances[0];
  for (const b of balances) {
    if (b.date <= targetStr) closest = b;
  }
  return closest?.amount ?? 0;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  if (!user) {
    const demoBalances = generateDemoBalances();
    const demoNetWorth = demoBalances[demoBalances.length - 1]?.amount ?? 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return {
      user,
      netWorth: demoNetWorth,
      netWorthFromThirtyDaysAgo: findDemoAmountAtDate(
        demoBalances,
        thirtyDaysAgo,
      ),
      netWorthFromStartOfYear: findDemoAmountAtDate(demoBalances, startOfYear),
      netWorthFromOneYearAgo: findDemoAmountAtDate(demoBalances, oneYearAgo),
      balances: demoBalances,
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
          <h1 style={{ textTransform: "uppercase" }}>
            Your net worth is {formatCurrency(netWorth)}
          </h1>
        ) : (
          <div className={styles.hero}>
            <h2 className={styles.headline}>
              I built the finance tool I couldn&apos;t find.
            </h2>
            <p className={styles.deck}>
              A self-hosted net worth tracker with automatic daily syncing,
              historical snapshots, and full data ownership - designed to run
              forever at near-zero cost.
            </p>
            <p className={styles.byline}>By Tyrel Clayton · Est. 2024</p>
          </div>
        )}
        <Flex gap={32} justifyContent="space-between">
          <Box>
            <h2>Highlights</h2>
            <ul>
              {thirtyDayChange !== 0 ? (
                <li>
                  {thirtyDayChange > 0 ? "Up" : "Down"}{" "}
                  {formatCurrency(thirtyDayChange, { includeCents: false })}{" "}
                  over the last 30 days
                </li>
              ) : null}

              {thisYearChange !== 0 ? (
                <li>
                  {thisYearChange > 0 ? "Up" : "Down"}{" "}
                  {formatCurrency(thisYearChange, { includeCents: false })}{" "}
                  since the beginning of this year
                </li>
              ) : null}

              {oneYearChange !== 0 ? (
                <li>
                  {oneYearChange > 0 ? "Up" : "Down"}{" "}
                  {formatCurrency(oneYearChange, { includeCents: false })} over
                  the last year
                </li>
              ) : null}
            </ul>
          </Box>
          <Flex flexGrow={1}>
            <BalanceChart
              balances={loaderData.balances}
              title="Net worth history"
            />
          </Flex>
        </Flex>
        {!user ? (
          <>
            <Divider />
            <div className={styles.editorial}>
              <div className={styles.story}>
                <p>
                  I lost years of financial history when Mint - Intuit&apos;s
                  personal finance app - shut down in early 2024. Rather than
                  migrate to another product with no guarantee of longevity, I
                  built a replacement I fully control.
                </p>
                <p>
                  Every decision in this project reflects a single priority:
                  durability. SQLite instead of Postgres - because a single file
                  is simpler to back up and reason about. Daily pulls instead of
                  webhooks - because they&apos;re free, predictable, and degrade
                  gracefully when they miss a day. Cookie sessions instead of
                  OAuth - because they&apos;re easy to audit and require no
                  third party.
                </p>
                <p>
                  The result has been running reliably in production since
                  January 2026. It syncs automatically each day via a scheduled
                  GitHub Actions job, requires almost no ongoing maintenance,
                  and has cost almost nothing to operate since launch.
                </p>
              </div>
              <aside className={styles.specsBox}>
                <h3 className={styles.specsTitle}>Specifications</h3>
                <dl className={styles.specsList}>
                  <div className={styles.specsItem}>
                    <dt className={styles.specsLabel}>Stack</dt>
                    <dd>React Router 7 · SQLite · Prisma · Plaid · Fly.io</dd>
                  </div>
                  <div className={styles.specsItem}>
                    <dt className={styles.specsLabel}>Auth</dt>
                    <dd>Cookie sessions · TOTP two-factor authentication</dd>
                  </div>
                  <div className={styles.specsItem}>
                    <dt className={styles.specsLabel}>Data model</dt>
                    <dd>Daily balance snapshots with carry-forward logic</dd>
                  </div>
                  <div className={styles.specsItem}>
                    <dt className={styles.specsLabel}>Background jobs</dt>
                    <dd>Scheduled GitHub Actions cron trigger</dd>
                  </div>
                  <div className={styles.specsItem}>
                    <dt className={styles.specsLabel}>Testing</dt>
                    <dd>Vitest · Cypress</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </>
        ) : null}
      </Box>
    </div>
  );
}
