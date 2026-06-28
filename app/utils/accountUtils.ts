import type {
  BalanceSnapshot,
  AccountType,
  PlaidAccount,
  Account,
} from "@prisma/client";

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

  const firstSnapshot = allSnapshots[0];
  if (!firstSnapshot) {
    return { currentNetWorth: 0, netWorth: [], accounts: [] };
  }

  // Get the month range from first snapshot to now
  const firstDate = new Date(firstSnapshot.dateTime);
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
      const year = Number(month.slice(0, 4));
      const monthNum = Number(month.slice(5, 7));
      const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

      // Move snapshot index to the latest snapshot in this month
      while (snapshotIdx < snapshots.length) {
        const snap = snapshots[snapshotIdx];
        if (!snap || new Date(snap.dateTime) > endOfMonth) break;
        lastKnownAmount = snap.amount;
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
        (total, acct) => total + (acct.balances[idx]?.amount ?? 0),
        0,
      );
      return { date: month, amount: sum };
    },
  );

  return {
    currentNetWorth: netWorth[netWorth.length - 1]?.amount ?? 0,
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

export interface AccountDisplayNameInput {
  id: Account["id"];
  customName: Account["customName"];
  plaidAccount: Pick<PlaidAccount, "officialName" | "name"> | null;
}

export const getAccountDisplayName = (account: AccountDisplayNameInput) => {
  return (
    account.customName ??
    account.plaidAccount?.name ??
    account.plaidAccount?.officialName ??
    "[Unnamed Account]"
  );
};

interface AccountFormErrors {
  customName?: string;
  type?: string;
}

type AccountFormResult =
  | { success: true; data: { customName: string; type: AccountType } }
  | { success: false; errors: AccountFormErrors };

export function validateAccountForm(formData: FormData): AccountFormResult {
  const customName = formData.get("customName");
  const type = formData.get("type");

  if (typeof customName !== "string" || customName === "") {
    return { success: false, errors: { customName: "This field is required" } };
  }

  if (typeof type !== "string" || type === "") {
    return { success: false, errors: { type: "This field is required" } };
  }

  if (!isAccountType(type)) {
    return { success: false, errors: { type: "Invalid account type" } };
  }

  return { success: true, data: { customName, type } };
}
