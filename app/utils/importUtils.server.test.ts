import { describe, expect, it } from "vitest";

import { prisma } from "~/db.server";
import { AccountFactory } from "~/factories/accountFactory";
import { UserFactory } from "~/factories/userFactory";

import { isCuid, parseImportCSV, runBulkImport } from "./importUtils.server";

const CUID_V1 = "clhqt5g4r0000r9bfgqp7g9ub"; // 25 chars, c-prefixed
const CUID_V2 = "ah1b2c3d4e5f6g7h8i9j0k1l"; // 24 chars, letter-prefixed

describe("isCuid", () => {
  it("accepts a cuid v1 string (25 chars, c-prefixed)", () => {
    expect(isCuid(CUID_V1)).toBe(true);
  });

  it("accepts a cuid v2 string (24 chars, letter-prefixed)", () => {
    expect(isCuid(CUID_V2)).toBe(true);
  });

  it("rejects a plain word", () => {
    expect(isCuid("Savings")).toBe(false);
  });

  it("rejects a string that is too short", () => {
    expect(isCuid("cabc")).toBe(false);
  });

  it("rejects a string with uppercase letters", () => {
    expect(isCuid("CLHQT5G4R0000R9BFGQP7G9UB")).toBe(false);
  });
});

describe("parseImportCSV", () => {
  describe("well-formed export-format CSV", () => {
    it("parses headers and data rows correctly", () => {
      const csv = `date,Chase Checking (${CUID_V1})\n2025-01-15,1234.56`;
      const result = parseImportCSV(csv);

      expect(result.columns).toHaveLength(1);
      expect(result.columns[0]).toEqual({
        kind: "name_and_id",
        displayName: "Chase Checking",
        accountId: CUID_V1,
      });
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({
        date: "2025-01-15",
        amounts: [1234.56],
      });
    });
  });

  describe("line endings", () => {
    it("handles \\n line endings", () => {
      const csv = `date,Checking (${CUID_V1})\n2025-01-15,100.00\n2025-01-16,200.00`;
      const result = parseImportCSV(csv);
      expect(result.rows).toHaveLength(2);
    });

    it("handles \\r\\n line endings", () => {
      const csv = `date,Checking (${CUID_V1})\r\n2025-01-15,100.00\r\n2025-01-16,200.00`;
      const result = parseImportCSV(csv);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe("quoted fields", () => {
    it("handles a column name containing a comma", () => {
      const csv = `date,"Savings, Primary (${CUID_V1})"\n2025-01-15,100.00`;
      const result = parseImportCSV(csv);
      expect(result.columns[0]).toEqual({
        kind: "name_and_id",
        displayName: "Savings, Primary",
        accountId: CUID_V1,
      });
    });

    it("handles a column name with an escaped double-quote", () => {
      const csv = `date,"My ""Special"" Account (${CUID_V1})"\n2025-01-15,100.00`;
      const result = parseImportCSV(csv);
      expect(result.columns[0]).toEqual({
        kind: "name_and_id",
        displayName: 'My "Special" Account',
        accountId: CUID_V1,
      });
    });
  });

  describe("empty cells", () => {
    it("treats a middle empty cell as null", () => {
      const csv = `date,Checking (${CUID_V1}),Savings (${CUID_V2})\n2025-01-15,,200.00`;
      const result = parseImportCSV(csv);
      expect(result.rows[0]!.amounts).toEqual([null, 200.0]);
    });

    it("treats a trailing empty cell as null", () => {
      const csv = `date,Checking (${CUID_V1}),Savings (${CUID_V2})\n2025-01-15,100.00,`;
      const result = parseImportCSV(csv);
      expect(result.rows[0]!.amounts).toEqual([100.0, null]);
    });
  });

  describe("header format detection", () => {
    it("detects 'Name (cuid)' as name_and_id", () => {
      const result = parseImportCSV(
        `date,Chase Checking (${CUID_V1})\n2025-01-15,100.00`,
      );
      expect(result.columns[0]).toEqual({
        kind: "name_and_id",
        displayName: "Chase Checking",
        accountId: CUID_V1,
      });
    });

    it("detects a bare cuid v1 as id_only", () => {
      const result = parseImportCSV(`date,${CUID_V1}\n2025-01-15,100.00`);
      expect(result.columns[0]).toEqual({
        kind: "id_only",
        accountId: CUID_V1,
      });
    });

    it("detects a bare cuid v2 as id_only", () => {
      const result = parseImportCSV(`date,${CUID_V2}\n2025-01-15,100.00`);
      expect(result.columns[0]).toEqual({
        kind: "id_only",
        accountId: CUID_V2,
      });
    });

    it("treats a plain name with no cuid as name_only", () => {
      const result = parseImportCSV(`date,My Savings\n2025-01-15,100.00`);
      expect(result.columns[0]).toEqual({
        kind: "name_only",
        displayName: "My Savings",
      });
    });

    it("treats 'Savings (joint)' as name_only and preserves the full string", () => {
      const result = parseImportCSV(`date,Savings (joint)\n2025-01-15,100.00`);
      expect(result.columns[0]).toEqual({
        kind: "name_only",
        displayName: "Savings (joint)",
      });
    });

    it("parses 'Savings (joint) (cuid)' as name_and_id with parens in display name", () => {
      const result = parseImportCSV(
        `date,Savings (joint) (${CUID_V1})\n2025-01-15,100.00`,
      );
      expect(result.columns[0]).toEqual({
        kind: "name_and_id",
        displayName: "Savings (joint)",
        accountId: CUID_V1,
      });
    });
  });
});

describe("runBulkImport", () => {
  it("routes figures to an existing account when matched by ID (Format 1)", async () => {
    const user = await UserFactory.create();
    const account = await AccountFactory.create({
      user: { connect: { id: user.id } },
    });

    const csv = `date,My Source (${account.id})\n2025-01-15,1234.56`;
    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result).toEqual({
      sourcesCreated: 0,
      figuresAdded: 1,
      figuresSkipped: 0,
    });

    const snapshots = await prisma.balanceSnapshot.findMany({
      where: { accountId: account.id },
    });
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]!.amount).toBe(123456);
    expect(snapshots[0]!.dateTime).toEqual(
      new Date("2025-01-15T00:00:00.000Z"),
    );
  });

  it("creates a new account for an unknown ID (Format 1)", async () => {
    const user = await UserFactory.create();

    const csv = `date,Unknown Source (${CUID_V1})\n2025-01-15,500.00`;
    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result.sourcesCreated).toBe(1);
    expect(result.figuresAdded).toBe(1);

    const newAccount = await prisma.account.findFirst({
      where: { userId: user.id, customName: "Unknown Source" },
    });
    expect(newAccount).not.toBeNull();
  });

  it("always creates a new account for a name-only header (Format 2)", async () => {
    const user = await UserFactory.create();

    const csv = `date,My Savings\n2025-01-15,100.00`;
    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result.sourcesCreated).toBe(1);
    expect(result.figuresAdded).toBe(1);

    const accounts = await prisma.account.findMany({
      where: { userId: user.id, customName: "My Savings" },
    });
    expect(accounts).toHaveLength(1);
  });

  it("matches an existing account for a bare cuid header (Format 3)", async () => {
    const user = await UserFactory.create();
    const account = await AccountFactory.create({
      user: { connect: { id: user.id } },
    });

    const csv = `date,${account.id}\n2025-01-15,200.00`;
    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result.sourcesCreated).toBe(0);
    expect(result.figuresAdded).toBe(1);
  });

  it("creates a nameless account for an unknown bare cuid header (Format 3)", async () => {
    const user = await UserFactory.create();

    const csv = `date,${CUID_V1}\n2025-01-15,300.00`;
    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result.sourcesCreated).toBe(1);
    expect(result.figuresAdded).toBe(1);

    const newAccount = await prisma.account.findFirst({
      where: { userId: user.id, customName: null },
    });
    expect(newAccount).not.toBeNull();
  });

  it("skips exact duplicate figures (same date and same amount)", async () => {
    const user = await UserFactory.create();
    const account = await AccountFactory.create({
      user: { connect: { id: user.id } },
    });

    await prisma.balanceSnapshot.create({
      data: {
        accountId: account.id,
        amount: 123456,
        dateTime: new Date("2025-01-15T00:00:00.000Z"),
      },
    });

    const csv = `date,My Source (${account.id})\n2025-01-15,1234.56`;
    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result.figuresAdded).toBe(0);
    expect(result.figuresSkipped).toBe(1);
  });

  it("does not skip when the date matches but the amount differs", async () => {
    const user = await UserFactory.create();
    const account = await AccountFactory.create({
      user: { connect: { id: user.id } },
    });

    await prisma.balanceSnapshot.create({
      data: {
        accountId: account.id,
        amount: 123456,
        dateTime: new Date("2025-01-15T00:00:00.000Z"),
      },
    });

    const csv = `date,My Source (${account.id})\n2025-01-15,1500.00`;
    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result.figuresAdded).toBe(1);
    expect(result.figuresSkipped).toBe(0);

    const snapshots = await prisma.balanceSnapshot.findMany({
      where: { accountId: account.id },
    });
    expect(snapshots).toHaveLength(2);
  });

  it("returns accurate counts across a multi-column CSV with mixed outcomes", async () => {
    const user = await UserFactory.create();
    const existingAccount = await AccountFactory.create({
      user: { connect: { id: user.id } },
    });

    await prisma.balanceSnapshot.create({
      data: {
        accountId: existingAccount.id,
        amount: 123456,
        dateTime: new Date("2025-01-15T00:00:00.000Z"),
      },
    });

    // Row 1, Col 1 (existingAccount, Jan 15, $1234.56): exact duplicate → skipped
    // Row 1, Col 2 (new account,     Jan 15, $500.00):  new source + new figure → added
    // Row 2, Col 1 (existingAccount, Jan 16, $2000.00): new date → added
    // Row 2, Col 2 (new account,     Jan 16, empty):    null → skipped entirely
    const csv = [
      `date,Existing (${existingAccount.id}),New Account`,
      `2025-01-15,1234.56,500.00`,
      `2025-01-16,2000.00,`,
    ].join("\n");

    const result = await runBulkImport(parseImportCSV(csv), user.id);

    expect(result.sourcesCreated).toBe(1);
    expect(result.figuresAdded).toBe(2);
    expect(result.figuresSkipped).toBe(1);
  });
});
