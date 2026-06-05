import { parse } from "csv-parse/sync";

import { prisma } from "~/db.server";

export type HeaderFormat =
  | { kind: "name_and_id"; displayName: string; accountId: string }
  | { kind: "name_only"; displayName: string }
  | { kind: "id_only"; accountId: string };

export interface ParsedImport {
  columns: HeaderFormat[];
  rows: {
    date: string;
    amounts: (number | null)[];
  }[];
}

export interface ImportResult {
  sourcesCreated: number;
  figuresAdded: number;
  figuresSkipped: number;
}

export const isCuid = (s: string): boolean =>
  /^c[a-z0-9]{24}$/.test(s) || // cuid v1: 25 chars, c-prefixed
  /^[a-z][a-z0-9]{23}$/.test(s); // cuid v2: 24 chars, any lowercase letter prefix

const NAME_AND_ID_RE = /^(.+) \(([^)]+)\)$/;

const parseHeader = (header: string): HeaderFormat => {
  if (isCuid(header)) {
    return { kind: "id_only", accountId: header };
  }

  const match = NAME_AND_ID_RE.exec(header);
  if (match && isCuid(match[2])) {
    return { kind: "name_and_id", displayName: match[1], accountId: match[2] };
  }

  return { kind: "name_only", displayName: header };
};

export const parseImportCSV = (csvText: string): ParsedImport => {
  const rawRows: string[][] = parse(csvText, {
    relax_column_count: true,
    skip_empty_lines: true,
  });

  if (rawRows.length === 0) {
    return { columns: [], rows: [] };
  }

  const [headerRow, ...dataRows] = rawRows;
  const [, ...columnHeaders] = headerRow; // skip the "date" column

  const columns = columnHeaders.map(parseHeader);

  const rows = dataRows.map((row) => ({
    date: row[0],
    amounts: columnHeaders.map((_, i) => {
      const cell = row[i + 1] ?? "";
      if (cell === "") return null;
      return parseFloat(cell);
    }),
  }));

  return { columns, rows };
};

export const runBulkImport = async (
  parsed: ParsedImport,
  userId: string,
): Promise<ImportResult> =>
  prisma.$transaction(async (tx) => {
    // 1. Load all of the user's accounts up front
    const existingAccounts = await tx.account.findMany({ where: { userId } });
    const accountsById = new Map(existingAccounts.map((a) => [a.id, a]));

    // 2. Resolve or create an account for each column, sequentially
    const { resolvedAccountIds, sourcesCreated } = await parsed.columns.reduce<
      Promise<{ resolvedAccountIds: string[]; sourcesCreated: number }>
    >(
      async (accP, col) => {
        const { resolvedAccountIds, sourcesCreated } = await accP;

        if (col.kind === "name_and_id") {
          const existing = accountsById.get(col.accountId);
          if (existing) {
            return {
              resolvedAccountIds: [...resolvedAccountIds, existing.id],
              sourcesCreated,
            };
          }
          const created = await tx.account.create({
            data: { customName: col.displayName, type: "other", userId },
          });
          return {
            resolvedAccountIds: [...resolvedAccountIds, created.id],
            sourcesCreated: sourcesCreated + 1,
          };
        }

        if (col.kind === "id_only") {
          const existing = accountsById.get(col.accountId);
          if (existing) {
            return {
              resolvedAccountIds: [...resolvedAccountIds, existing.id],
              sourcesCreated,
            };
          }
          const created = await tx.account.create({
            data: { customName: null, type: "other", userId },
          });
          return {
            resolvedAccountIds: [...resolvedAccountIds, created.id],
            sourcesCreated: sourcesCreated + 1,
          };
        }

        // name_only: always create a new account
        const created = await tx.account.create({
          data: { customName: col.displayName, type: "other", userId },
        });
        return {
          resolvedAccountIds: [...resolvedAccountIds, created.id],
          sourcesCreated: sourcesCreated + 1,
        };
      },
      Promise.resolve({ resolvedAccountIds: [], sourcesCreated: 0 }),
    );

    // 3. Load all existing snapshots for the involved accounts
    const existingSnapshots = await tx.balanceSnapshot.findMany({
      where: { accountId: { in: resolvedAccountIds } },
    });

    // Dedup key: "accountId:YYYY-MM-DD:amountCents"
    const dedupSet = new Set(
      existingSnapshots.map(
        (s) =>
          `${s.accountId}:${s.dateTime.toISOString().split("T")[0]}:${s.amount}`,
      ),
    );

    // 4. Collect new snapshots, skipping exact duplicates
    let figuresAdded = 0;
    let figuresSkipped = 0;
    const toCreate: { accountId: string; amount: number; dateTime: Date }[] =
      [];

    parsed.rows
      .flatMap((row) =>
        row.amounts.map((rawAmount, colIdx) => ({
          date: row.date,
          rawAmount,
          colIdx,
        })),
      )
      .filter(
        (cell): cell is { date: string; rawAmount: number; colIdx: number } =>
          cell.rawAmount !== null,
      )
      .forEach(({ date, rawAmount, colIdx }) => {
        const accountId = resolvedAccountIds[colIdx];
        const amountCents = Math.round(rawAmount * 100);
        const dedupKey = `${accountId}:${date}:${amountCents}`;

        if (dedupSet.has(dedupKey)) {
          figuresSkipped++;
        } else {
          figuresAdded++;
          toCreate.push({
            accountId,
            amount: amountCents,
            dateTime: new Date(`${date}T00:00:00.000Z`),
          });
        }
      });

    // 5. Batch insert all new snapshots
    if (toCreate.length > 0) {
      await tx.balanceSnapshot.createMany({ data: toCreate });
    }

    return { sourcesCreated, figuresAdded, figuresSkipped };
  });
