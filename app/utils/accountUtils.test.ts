import {
  GetNormalizedNetWorthInputAccount,
  getNormalizedUserNetWorth,
} from "./accountUtils";

// eslint-disable-next-line jest/no-disabled-tests
describe.skip("getNormalizedUserNetWorth", () => {
  const mockBalanceSnapshot = (
    overrides: Partial<
      GetNormalizedNetWorthInputAccount["balanceSnapshots"][number]
    > = {},
  ): GetNormalizedNetWorthInputAccount["balanceSnapshots"][number] => ({
    id: "snap_asdfasdf",
    amount: 10000,
    dateTime: new Date(2025, 4, 5),
    ...overrides,
  });

  const mockGetNormalizedNetWorthInputAccount = (
    overrides: Partial<GetNormalizedNetWorthInputAccount> = {},
  ): GetNormalizedNetWorthInputAccount => ({
    id: "acct_asdfasdf",
    balanceSnapshots: [mockBalanceSnapshot()],
    ...overrides,
  });

  it("returns an empty object for an empty array", () => {
    expect(getNormalizedUserNetWorth([])).toEqual({
      currentNetWorth: 0,
      netWorth: [],
      accounts: [],
    });
  });

  it("returns the correct data for a single account with no snapshots", () => {
    expect(
      getNormalizedUserNetWorth([
        {
          id: "acct_asdfasdf",
          balanceSnapshots: [],
        },
      ]),
    ).toEqual({
      currentNetWorth: 0,
      netWorth: [],
      accounts: [],
    });
  });

  it("normalizes a single snapshot date to the end of the month", () => {
    expect(
      getNormalizedUserNetWorth([mockGetNormalizedNetWorthInputAccount()]),
    ).toEqual({
      currentNetWorth: 10000,
      netWorth: [{ date: "2025-05-31", amount: 10000 }],
      accounts: [
        {
          accountId: "acct_asdfasdf",
          balances: [{ date: "2025-05-31", amount: 10000 }],
        },
      ],
    });
  });

  it("takes the later of two snapshots if they are in the same month", () => {
    expect(
      getNormalizedUserNetWorth([
        mockGetNormalizedNetWorthInputAccount({
          balanceSnapshots: [
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 10),
              amount: 20000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 15),
              amount: 10000,
            }),
          ],
        }),
      ]),
    ).toEqual({
      currentNetWorth: 10000,
      netWorth: [{ date: "2025-05-31", amount: 10000 }],
      accounts: [
        {
          accountId: "acct_asdfasdf",
          balances: [{ date: "2025-05-31", amount: 10000 }],
        },
      ],
    });
  });

  it("groups snapshots by month", () => {
    expect(
      getNormalizedUserNetWorth([
        mockGetNormalizedNetWorthInputAccount({
          balanceSnapshots: [
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 10),
              amount: 12000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 20),
              amount: 40000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 10),
              amount: 20000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 15),
              amount: 10000,
            }),
          ],
        }),
      ]),
    ).toEqual({
      currentNetWorth: 10000,
      netWorth: [
        { date: "2025-04-30", amount: 40000 },
        { date: "2025-05-31", amount: 10000 },
      ],
      accounts: [
        {
          accountId: "acct_asdfasdf",
          balances: [
            { date: "2025-04-30", amount: 40000 },
            { date: "2025-05-31", amount: 10000 },
          ],
        },
      ],
    });
  });

  it("can handle multiple accounts", () => {
    expect(
      getNormalizedUserNetWorth([
        mockGetNormalizedNetWorthInputAccount({
          balanceSnapshots: [
            mockBalanceSnapshot({
              dateTime: new Date(2025, 2, 2),
              amount: 12345,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 2),
              amount: 23456,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 2),
              amount: 34567,
            }),
          ],
        }),
        mockGetNormalizedNetWorthInputAccount({
          id: "acct_qwerqwer",
          balanceSnapshots: [
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 10),
              amount: 12000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 20),
              amount: 40000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 10),
              amount: 20000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 15),
              amount: 10000,
            }),
          ],
        }),
      ]),
    ).toEqual({
      currentNetWorth: 44567,
      netWorth: [
        { date: "2025-03-31", amount: 12345 },
        { date: "2025-04-30", amount: 63456 },
        { date: "2025-05-31", amount: 44567 },
      ],
      accounts: [
        {
          accountId: "acct_asdfasdf",
          balances: [
            { date: "2025-03-31", amount: 12345 },
            { date: "2025-04-30", amount: 23456 },
            { date: "2025-05-31", amount: 34567 },
          ],
        },
        {
          accountId: "acct_qwerqwer",
          balances: [
            { amount: 0, date: "2025-03-31" },
            { amount: 40000, date: "2025-04-30" },
            { amount: 10000, date: "2025-05-31" },
          ],
        },
      ],
    });
  });

  it("can handle multiple accounts when a later account has earlier snapshots", () => {
    expect(
      getNormalizedUserNetWorth([
        mockGetNormalizedNetWorthInputAccount({
          balanceSnapshots: [
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 2),
              amount: 23456,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 2),
              amount: 34567,
            }),
          ],
        }),
        mockGetNormalizedNetWorthInputAccount({
          id: "acct_qwerqwer",
          balanceSnapshots: [
            mockBalanceSnapshot({
              dateTime: new Date(2025, 1, 10),
              amount: 75000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 2, 10),
              amount: 2000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 10),
              amount: 12000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 3, 20),
              amount: 40000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 10),
              amount: 20000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 15),
              amount: 10000,
            }),
          ],
        }),
      ]),
    ).toEqual({
      currentNetWorth: 44567,
      netWorth: [
        { date: "2025-02-28", amount: 75000 },
        { date: "2025-03-31", amount: 2000 },
        { date: "2025-04-30", amount: 63456 },
        { date: "2025-05-31", amount: 44567 },
      ],
      accounts: [
        {
          accountId: "acct_asdfasdf",
          balances: [
            { date: "2025-02-28", amount: 0 },
            { date: "2025-03-31", amount: 0 },
            { date: "2025-04-30", amount: 23456 },
            { date: "2025-05-31", amount: 34567 },
          ],
        },
        {
          accountId: "acct_qwerqwer",
          balances: [
            { amount: 75000, date: "2025-02-28" },
            { amount: 2000, date: "2025-03-31" },
            { amount: 40000, date: "2025-04-30" },
            { amount: 10000, date: "2025-05-31" },
          ],
        },
      ],
    });
  });

  it("can handle missing months", () => {
    expect(
      getNormalizedUserNetWorth([
        mockGetNormalizedNetWorthInputAccount({
          balanceSnapshots: [
            mockBalanceSnapshot({
              dateTime: new Date(2025, 2, 10),
              amount: 20000,
            }),
            mockBalanceSnapshot({
              dateTime: new Date(2025, 4, 15),
              amount: 10000,
            }),
          ],
        }),
      ]),
    ).toEqual({
      currentNetWorth: 10000,
      netWorth: [
        { date: "2025-03-31", amount: 20000 },
        { date: "2025-04-30", amount: 20000 },
        { date: "2025-05-31", amount: 10000 },
      ],
      accounts: [
        {
          accountId: "acct_asdfasdf",
          balances: [
            { date: "2025-03-31", amount: 20000 },
            { date: "2025-04-30", amount: 20000 },
            { date: "2025-05-31", amount: 10000 },
          ],
        },
      ],
    });
  });
});
