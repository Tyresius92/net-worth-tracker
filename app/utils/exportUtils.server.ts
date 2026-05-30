interface SnapshotInput {
  amount: number;
  date: string;
}

interface AccountInput {
  id: string;
  customName: string | null;
  plaidAccount: { name: string; officialName: string | null } | null;
  balanceSnapshots: SnapshotInput[];
}

const getDisplayName = (account: AccountInput): string =>
  account.customName ??
  account.plaidAccount?.name ??
  account.plaidAccount?.officialName ??
  account.id;

const escapeCSV = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const buildCSV = (accounts: AccountInput[]): string => {
  // Build per-account date→amount maps. Snapshots are ordered by dateTime asc,
  // so iterating in order means the last write for a given date wins.
  const snapshotsByAccount = new Map(
    accounts.map((account) => {
      const dateMap = new Map<string, number>();
      for (const snapshot of account.balanceSnapshots) {
        dateMap.set(snapshot.date, snapshot.amount);
      }
      return [account.id, dateMap];
    }),
  );

  // Collect all unique dates across all accounts, sorted ascending.
  const allDates = new Set<string>();
  for (const dateMap of snapshotsByAccount.values()) {
    for (const date of dateMap.keys()) {
      allDates.add(date);
    }
  }
  const sortedDates = Array.from(allDates).sort();

  const headerRow = [
    "date",
    ...accounts.map((a) => escapeCSV(`${getDisplayName(a)} (${a.id})`)),
  ].join(",");

  const dataRows = sortedDates.map((date) =>
    [
      date,
      ...accounts.map((a) => {
        const amountCents = snapshotsByAccount.get(a.id)?.get(date);
        return amountCents !== undefined ? (amountCents / 100).toFixed(2) : "";
      }),
    ].join(","),
  );

  return [headerRow, ...dataRows].join("\n");
};
