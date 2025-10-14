import { BalanceSnapshot , AccountType } from "@prisma/client";

import { Account } from "~/models/account.server";

function formatMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getDate(),
  ).padStart(2, "0")}`;
}

function addMonth(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
  );
  return d;
}

function monthDiff(from: Date, to: Date): number {
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth())
  );
}

export interface GetNormalizedNetWorthInputAccount {
  id: Account["id"];
  balanceSnapshots: Pick<BalanceSnapshot, "id" | "dateTime" | "amount">[];
}

/** A string in the format "YYYY-MM-DD" */
type DateString = string;

export interface NormalizedNetWorth {
  currentNetWorth: number;
  netWorth: { date: DateString; amount: number }[];
  accounts: {
    accountId: string;
    balances: { date: DateString; amount: number }[];
  }[];
}

export function getNormalizedUserNetWorth(
  accounts: GetNormalizedNetWorthInputAccount[],
): NormalizedNetWorth {
  const allSnapshots = accounts
    .flatMap((account) =>
      account.balanceSnapshots.map((s) => ({ ...s, accountId: account.id })),
    )
    .sort((a, b) => (a.dateTime < b.dateTime ? -1 : 1));

  if (allSnapshots.length === 0) {
    return { currentNetWorth: 0, netWorth: [], accounts: [] };
  }

  // Get the month range from first snapshot to now
  const firstDate = new Date(allSnapshots[0].dateTime);
  const now = new Date();
  const totalMonths = monthDiff(firstDate, now);

  const allMonths: string[] = [];
  let cursor = new Date(
    Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), 1),
  );
  for (let i = 0; i <= totalMonths; i++) {
    allMonths.push(formatMonth(cursor));
    cursor = addMonth(cursor);
  }

  const accountBalances: NormalizedNetWorth["accounts"] = [];

  for (const account of accounts) {
    const snapshots = account.balanceSnapshots;
    const balances: { date: DateString; amount: number }[] = [];
    let snapshotIdx = 0;
    let lastKnownAmount: number | null = null;

    for (const month of allMonths) {
      const [year, monthStr] = month.split("-").map(Number);
      const endOfMonth = new Date(Date.UTC(year, monthStr, 0, 23, 59, 59, 999));

      // Move snapshot index to the latest snapshot in this month
      while (
        snapshotIdx < snapshots.length &&
        new Date(snapshots[snapshotIdx].dateTime) <= endOfMonth
      ) {
        lastKnownAmount = snapshots[snapshotIdx].amount;
        snapshotIdx++;
      }

      if (lastKnownAmount !== null) {
        balances.push({ date: month, amount: lastKnownAmount });
      } else {
        // No data yet for this month or before — omit
        balances.push({ date: month, amount: 0 }); // or omit the month if preferred
      }
    }

    accountBalances.push({ accountId: account.id, balances });
  }

  // Compute total net worth per month
  const netWorth: { date: DateString; amount: number }[] = allMonths.map(
    (month, idx) => {
      const sum = accountBalances.reduce(
        (total, acct) => total + acct.balances[idx].amount,
        0,
      );
      return { date: month, amount: sum };
    },
  );

  return {
    currentNetWorth: netWorth[netWorth.length - 1].amount,
    netWorth,
    accounts: accountBalances,
  };
}


export const accountTypesList: AccountType[] = [
  "checking",
  "credit_card",
  "loan",
  "money_market",
  "mortgage",
  "property",
  "retirement_401k",
  "roth_ira",
  "savings",
  "traditional_ira",
  "other",
];

export const isAccountType = (value: string): value is AccountType => {
  return [
    "checking",
    "credit_card",
    "loan",
    "money_market",
    "mortgage",
    "property",
    "retirement_401k",
    "roth_ira",
    "savings",
    "traditional_ira",
    "other",
  ].includes(value);
};

const prettyAccountTypes: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  other: "Other",
  credit_card: "Credit Card",
  mortgage: "Mortgage",
  property: "Property",
  loan: "Loan",
  money_market: "Money Market",
  retirement_401k: "401k",
  roth_ira: "Roth IRA",
  traditional_ira: "Traditional IRA",
} as const;

export const toPrettyAccountType = (type: AccountType): string => {
  return prettyAccountTypes[type];
};
