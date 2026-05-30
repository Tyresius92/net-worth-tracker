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
import { Link } from "~/components/Link/Link";
import { Table } from "~/components/Table/Table";
import { Text } from "~/components/Text/Text";
import { prisma } from "~/db.server";
import { getLatestBalancesAsOfDate } from "~/models/user.server";
import { getUser } from "~/session.server";
import { fillDailyBalanceDayData } from "~/utils/balanceUtils";
import { formatCurrency } from "~/utils/currencyUtils";
import { formatDate, getDateNDaysAgo } from "~/utils/dateUtils";
import { getUserNetWorth } from "~/utils/netWorthUtils.server";

import type { Route as RootRoute } from "../+types/root";

import type { Route } from "./+types/_index";

export const meta: MetaFunction = () => [{ title: "The Ledger" }];

function generateDemoBalances() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  const monthsBack = 20 + Math.floor(Math.random() * 9); // 20–28 months
  startDate.setMonth(startDate.getMonth() - monthsBack);
  startDate.setDate(1 + Math.floor(Math.random() * 28)); // random day 1–28

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

  return { balances, startDate, today };
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
    const {
      balances: demoBalances,
      startDate: demoStartDate,
      today: demoToday,
    } = generateDemoBalances();
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
      startDate: demoStartDate.toISOString(),
      today: demoToday.toISOString(),
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
    today: new Date().toISOString(),
    startDate: userData.accounts
      .reduce((acc, curr) => {
        const snapDate = curr.balanceSnapshots[0]?.dateTime ?? undefined;

        if (snapDate && snapDate < acc) {
          return snapDate;
        }

        return acc;
      }, new Date())
      .toISOString(),
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
    startDate,
    today,
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
                <br />{' '}
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
                        source you choose to add. It does not sell advertising.
                        It does not surface offers. It does not measure your
                        savings rate against a peer cohort, nor does it
                        congratulate you for any of it. The Ledger reports what
                        is.
                      </Text>
                    </Box>
                    <Box xsMb={16}>
                      <Text>
                        To use it, you sign up for press credentials (issued in
                        two minutes), add the sources you want it to know about,
                        and from then on the page shows you, day after day,
                        where things stand. Balances flow in. The chart updates.
                        Nothing is shouted at you.
                      </Text>
                    </Box>
                    <Box xsMb={16}>
                      <Text>
                        Sources can be added two ways. The first is by hand,
                        which works for the parts of American finance that no
                        API has caught up with (your mortgage servicer, a CD at
                        a credit union, the cash under your mattress, the
                        savings bond your grandmother bought in 1994). The
                        second is through wire services powered by Plaid, the
                        same connection layer your bank already uses, which
                        files figures automatically and silently into your
                        record.
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
      {user ? (
        <></>
      ) : (
        <div
          className={rootLoaderData?.colorMode === "dark" ? "light" : "dark"}
        >
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
      )}
      {user ? null : (
        <Box xsPx={56} xsPy={32}>
          <Box display="flex" justifyContent="space-between" xsPb={16}>
            <Text variant="byline">Section B · Figures of Record</Text>
            <Text variant="byline">From a sample subscriber</Text>
          </Box>
          <Divider variant="heavy" />
          <Grid gap={32} rowGap={32}>
            <Grid.Item xs={12} l={4}>
              <Box xsPt={16} display="flex" flexDirection="column" xsGap={12}>
                <Text variant="byline">Table 1 · Sources of Record</Text>
                <Heading level={3}>The Ledger, as of yesterday evening</Heading>
                <Divider />
                <Table caption="Sources of Record">
                  <Table.Head>
                    <Table.ColumnHeader>Wire service</Table.ColumnHeader>
                    <Table.ColumnHeader>Source</Table.ColumnHeader>
                    <Table.ColumnHeader>Figure</Table.ColumnHeader>
                  </Table.Head>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>Fidelity</Table.Cell>
                      <Table.Cell>Brokerage · 4421</Table.Cell>
                      <Table.Cell align="end">$48,210.92</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Vanguard</Table.Cell>
                      <Table.Cell>Roth IRA · 0019</Table.Cell>
                      <Table.Cell align="end">$71,488.04</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Chase</Table.Cell>
                      <Table.Cell>Checking · 8810</Table.Cell>
                      <Table.Cell align="end">$8,742.18</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Ally</Table.Cell>
                      <Table.Cell>Savings · 2207</Table.Cell>
                      <Table.Cell align="end">$14,002.00</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Chase</Table.Cell>
                      <Table.Cell>Mortgage · 7733</Table.Cell>
                      <Table.Cell align="end">
                        {formatCurrency(-2999420)}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Robin Hood</Table.Cell>
                      <Table.Cell>Brokerage · 0410</Table.Cell>
                      <Table.Cell align="end">$36,001.36</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                  <Table.Foot>
                    <Table.RowHeader>Total</Table.RowHeader>
                    <Table.Cell />
                    <Table.Cell align="end">$148,450.30</Table.Cell>
                  </Table.Foot>
                </Table>
              </Box>
            </Grid.Item>
            <Grid.Item xs={12} l={8}>
              <Box xsPt={16}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Heading level={2}>Fig. 1 · Net worth, by month</Heading>
                  <Text variant="byline">
                    {formatDate(new Date(startDate))} through{" "}
                    {formatDate(new Date(today))}
                  </Text>
                </Box>
                <BalanceChart
                  balances={loaderData.balances}
                  title="Net worth history"
                />
                <Divider />
                <Box
                  xsColumns={1}
                  lColumns={4}
                  columnRule={{ color: "sand-7" }}
                  xsPt={16}
                >
                  <Box>
                    <Text variant="byline">Today</Text>
                    <Heading level={3} fontSize={36}>
                      {formatCurrency(netWorth, { includeCents: false })}
                    </Heading>
                  </Box>
                  <Box>
                    <Text variant="byline">Last 30 days</Text>
                    <Heading level={3} fontSize={36}>
                      {formatCurrency(thirtyDayChange, { includeCents: false })}
                    </Heading>
                  </Box>
                  <Box>
                    <Text variant="byline">Year to date</Text>
                    <Heading level={3} fontSize={36}>
                      {formatCurrency(thisYearChange, { includeCents: false })}
                    </Heading>
                  </Box>
                  <Box>
                    <Text variant="byline">Since Jan &apos;25</Text>
                    <Heading level={3} fontSize={36}>
                      {formatCurrency(oneYearChange, { includeCents: false })}
                    </Heading>
                  </Box>
                </Box>
              </Box>
            </Grid.Item>
          </Grid>
        </Box>
      )}
      {user ? (
        <Box display="flex" xsGap={32} justifyContent="space-between">
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
          <Box display="flex" flexGrow={1}>
            <BalanceChart
              balances={loaderData.balances}
              title="Net worth history"
            />
          </Box>
        </Box>
      ) : (
        <Box xsPx={56} xsPy={32}>
          <Grid gap={56} rowGap={32}>
            <Grid.Item xs={12} l={7}>
              <Box display="flex" flexDirection="column" xsGap={12}>
                <Text variant="byline">From the Editor · C.1</Text>
                <Heading level={2}>The page reports what is.</Heading>
                <Text>
                  Most personal-finance software is, at its core, an advertising
                  surface. It must be, because the underlying business is
                  showing you the next credit card. The Ledger has no underlying
                  business of that kind. It will not nudge you toward a balance
                  transfer. It will not tell you that you spend too much on
                  coffee.
                </Text>
                <Text>
                  The page is monochrome on purpose. Numbers that go up are not
                  green; numbers that go down are not red. They are figures. The
                  figure for last month, set next to the figure for this month,
                  will tell you what you need to know without any help from us.
                </Text>
                <Text>
                  Your data is yours. You can export it any time. You can delete
                  it any time. We have nothing to sell that depends on you doing
                  either.
                </Text>
                <Divider />
                <Text variant="byline">The Editors</Text>
              </Box>
            </Grid.Item>
            <Grid.Item xs={12} l={5}>
              <div
                className={
                  rootLoaderData?.colorMode === "dark" ? "light" : "dark"
                }
              >
                <Box bg="sand-3" xsP={32}>
                  <Text variant="byline">Pulled from the Lede</Text>
                  <Heading level={2} fontSize={36}>
                    &ldquo;The chart is monochrome on purpose. Numbers that go
                    up are not green; numbers that go down are not red. They are
                    figures.&rdquo;
                  </Heading>
                  <Text variant="byline">The Editors · Page A1</Text>
                </Box>
              </div>
            </Grid.Item>
          </Grid>
        </Box>
      )}
      {user ? null : (
        <Box xsPx={56} xsPy={32}>
          <Box display="flex" justifyContent="space-between" xsPb={16}>
            <Text variant="byline">Section C.3 · How to Subscribe</Text>
            <Text variant="byline">The Shortest Article in This Edition</Text>
          </Box>
          <Divider variant="heavy" />
          <Box
            border={{ color: "sand-12", width: 3 }}
            xsMt={16}
            xsP={32}
            textAlign="center"
          >
            <Heading level={1} fontSize={72}>
              An Email. A Password. Two Minutes.
            </Heading>
            <Text variant="deck">
              Press credentials are the only way to use The Ledger. They are
              free. They are issued in two minutes. They open a record: a daily
              chart of all the figures recorded by your sources.
            </Text>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              xsGap={16}
              xsMt={16}
            >
              <Link to="/join">Apply for credentials</Link>
              <Link to="/login">Present credentials</Link>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
}
