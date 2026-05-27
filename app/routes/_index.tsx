import {
  useRouteLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { BalanceChart } from "~/components/BalanceChart/BalanceChart";
import { Box } from "~/components/Box/Box";
import { Divider } from "~/components/Divider/Divider";
import { Grid } from "~/components/Grid/Grid";
import { Heading } from "~/components/Heading/Heading";
import { Text } from "~/components/Text/Text";
import { prisma } from "~/db.server";
import { getLatestBalancesAsOfDate } from "~/models/user.server";
import { getUser } from "~/session.server";
import { fillDailyBalanceDayData } from "~/utils/balanceUtils";
import { formatCurrency } from "~/utils/currencyUtils";
import { getDateNDaysAgo } from "~/utils/dateUtils";
import { getUserNetWorth } from "~/utils/netWorthUtils.server";

import type { Route as RootRoute } from "../+types/root";

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
  const rootLoaderData =
    useRouteLoaderData<RootRoute.ComponentProps["loaderData"]>("root");

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
      <Box xsPx={56}>
        {user ? (
          <h1 style={{ textTransform: "uppercase" }}>
            Your net worth is {formatCurrency(netWorth)}
          </h1>
        ) : (
          <Box xsPy={32}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
              xsPt={32}
              xsGap={16}
            >
              <Heading level={1} fontSize={88}>
                A Ledger
                <br />
                of Your Own
              </Heading>
              <Text variant="deck">
                A privacy-first net worth tracker for anyone in the United
                States with accounts worth keeping track of.
              </Text>
              <Text>
                Manual where it must be. Automatic where it can be. Nothing in
                between trying to sell you something.
              </Text>
              <Text variant="byline">
                By the Editors · Reported from your kitchen table
              </Text>
            </Box>
            <Box xsPt={16}>
              <Grid>
                <Grid.Item xs={12} m={3}></Grid.Item>
                <Grid.Item xs={12} m={6}>
                  <Box
                    xsColumns={1}
                    lColumns={2}
                    columnRule={{
                      color: "sand-7",
                    }}
                    xsColumnGap={56}
                  >
                    <Box xsMb={16}>
                      <Text dropCap>
                        The Ledger is a personal net worth tracker. It collects,
                        in one place, what you own and what you owe across every
                        account you choose to add. It does not sell advertising.
                        It does not surface offers. It does not measure your
                        savings rate against a peer cohort, nor does it
                        congratulate you for any of it. The Ledger reports what
                        is.
                      </Text>
                    </Box>
                    <Box xsMb={16}>
                      <Text>
                        To use it, you sign up for a free subscription, add the
                        accounts you want it to know about, and from then on the
                        page shows you, day after day, where things stand.
                        Balances flow in. The chart updates. Nothing is shouted
                        at you.
                      </Text>
                    </Box>
                    <Box xsMb={16}>
                      <Text>
                        Accounts can be added two ways. The first is by hand,
                        which works for the parts of American finance that no
                        API has caught up with (your mortgage servicer, a CD at
                        a credit union, the cash under your mattress, the
                        savings bond your grandmother bought in 1994). The
                        second is through Plaid, the same connection layer your
                        bank already uses, which pulls balances automatically
                        and silently into your file.
                      </Text>
                    </Box>
                    <Box xsMb={16}>
                      <Text>
                        Both methods coexist. You are not asked to pick.
                      </Text>
                    </Box>
                    <Box xsMb={16}>
                      <Text>
                        The Ledger is free. It will remain free. If, after some
                        weeks of using it, you find it useful, there is a tip
                        jar. The tip jar is on a separate page. It is not
                        connected to any data you see in the application, and it
                        is the only place money changes hands.
                      </Text>
                    </Box>
                    <Box xsMb={16}>
                      <Text>
                        To begin, sign up. It takes a minute and asks for very
                        little.
                      </Text>
                    </Box>
                  </Box>
                </Grid.Item>
                <Grid.Item xs={12} m={3}></Grid.Item>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
      <div className={rootLoaderData?.colorMode === "dark" ? "light" : "dark"}>
        <Box xsPx={56} xsPy={32} bg="sand-3">
          <Box display="flex" justifyContent="space-between" xsPb={16}>
            <Text variant="byline">Section A · Our Principles</Text>
            <Text variant="byline">Five Rules, Settled on the first day</Text>
          </Box>
          <Divider variant="heavy" />
          <Box
            xsColumns={1}
            lColumns={5}
            columnRule={{ color: "sand-7" }}
            xsMt={24}
          >
            <Box xsPx={16}>
              <Heading level={3} fontSize={60}>
                01
              </Heading>
              <Heading level={3} fontSize={20}>
                No advertising
              </Heading>
              <Text>
                There is no advertising business in The Ledger. Nothing in the
                page is sold.
              </Text>
            </Box>
            <Box xsPx={16}>
              <Heading level={3} fontSize={60}>
                02
              </Heading>
              <Heading level={3} fontSize={20}>
                No upsells
              </Heading>
              <Text>
                There is one tier. It is the free one. It will remain the free
                one.
              </Text>
            </Box>
            <Box xsPx={16}>
              <Heading level={3} fontSize={60}>
                03
              </Heading>
              <Heading level={3} fontSize={20}>
                No coaching
              </Heading>
              <Text>
                The Ledger does not congratulate, commiserate, or compare you
                against a peer cohort.
              </Text>
            </Box>
            <Box xsPx={16}>
              <Heading level={3} fontSize={60}>
                04
              </Heading>
              <Heading level={3} fontSize={20}>
                No nudges
              </Heading>
              <Text>
                No push notifications. No emails. No surfaced offers. No
                streaks.
              </Text>
            </Box>
            <Box xsPx={16}>
              <Heading level={3} fontSize={60}>
                05
              </Heading>
              <Heading level={3} fontSize={20}>
                Yours to delete
              </Heading>
              <Text>
                Your data exports as a single file. It deletes from a single
                button. Permanently.
              </Text>
            </Box>
          </Box>
        </Box>
      </div>
      <Box display="flex" xsGap={32} justifyContent="space-between">
        <Box>
          <h2>Highlights</h2>
          <ul>
            {thirtyDayChange !== 0 ? (
              <li>
                {thirtyDayChange > 0 ? "Up" : "Down"}{" "}
                {formatCurrency(thirtyDayChange, { includeCents: false })} over
                the last 30 days
              </li>
            ) : null}

            {thisYearChange !== 0 ? (
              <li>
                {thisYearChange > 0 ? "Up" : "Down"}{" "}
                {formatCurrency(thisYearChange, { includeCents: false })} since
                the beginning of this year
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
        <Box display="flex" flexGrow={1}>
          <BalanceChart
            balances={loaderData.balances}
            title="Net worth history"
          />
        </Box>
      </Box>
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
                OAuth - because they&apos;re easy to audit and require no third
                party.
              </p>
              <p>
                The result has been running reliably in production since January
                2026. It syncs automatically each day via a scheduled GitHub
                Actions job, requires almost no ongoing maintenance, and has
                cost almost nothing to operate since launch.
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
    </div>
  );
}
