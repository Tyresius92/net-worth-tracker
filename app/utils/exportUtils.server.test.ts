import { describe, it, expect } from "vitest";

import { buildCSV } from "./exportUtils.server";

const account = (
  overrides: Partial<Parameters<typeof buildCSV>[0][number]> & { id: string },
) => ({
  customName: null,
  plaidAccount: null,
  balanceSnapshots: [],
  ...overrides,
});

describe("buildCSV", () => {
  describe("no accounts", () => {
    it("returns only the date header", () => {
      expect(buildCSV([])).toBe("date");
    });
  });

  describe("account with no snapshots", () => {
    it("includes the account column in the header but no data rows", () => {
      const result = buildCSV([account({ id: "acc1", customName: "Checking" })]);
      expect(result).toBe("date,Checking (acc1)");
    });
  });

  describe("single account, single snapshot", () => {
    it("returns a header row and one data row", () => {
      const lines = buildCSV([
        account({
          id: "acc1",
          customName: "Checking",
          balanceSnapshots: [{ amount: 123456, date: "2025-01-15" }],
        }),
      ]).split("\n");

      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe("date,Checking (acc1)");
      expect(lines[1]).toBe("2025-01-15,1234.56");
    });
  });

  describe("multiple accounts", () => {
    it("produces one column per account in input order", () => {
      const header = buildCSV([
        account({ id: "acc1", customName: "Checking" }),
        account({ id: "acc2", customName: "Savings" }),
      ])
        .split("\n")[0];

      expect(header).toBe("date,Checking (acc1),Savings (acc2)");
    });

    it("leaves cells blank for accounts with no snapshot on a given date", () => {
      const lines = buildCSV([
        account({
          id: "acc1",
          customName: "Checking",
          balanceSnapshots: [{ amount: 10000, date: "2025-01-01" }],
        }),
        account({
          id: "acc2",
          customName: "Savings",
          balanceSnapshots: [{ amount: 20000, date: "2025-01-02" }],
        }),
      ]).split("\n");

      expect(lines[1]).toBe("2025-01-01,100.00,");
      expect(lines[2]).toBe("2025-01-02,,200.00");
    });
  });

  describe("date ordering", () => {
    it("sorts all dates ascending regardless of snapshot insertion order", () => {
      const lines = buildCSV([
        account({
          id: "acc1",
          customName: "A",
          balanceSnapshots: [
            { amount: 300, date: "2025-03-01" },
            { amount: 100, date: "2025-01-01" },
            { amount: 200, date: "2025-02-01" },
          ],
        }),
      ]).split("\n");

      expect(lines[1]).toMatch(/^2025-01-01/);
      expect(lines[2]).toMatch(/^2025-02-01/);
      expect(lines[3]).toMatch(/^2025-03-01/);
    });
  });

  describe("multiple snapshots on the same date", () => {
    it("uses the last entry in the array for a given date", () => {
      const lines = buildCSV([
        account({
          id: "acc1",
          customName: "Checking",
          balanceSnapshots: [
            { amount: 10000, date: "2025-01-01" },
            { amount: 99999, date: "2025-01-01" },
          ],
        }),
      ]).split("\n");

      expect(lines[1]).toBe("2025-01-01,999.99");
    });
  });

  describe("display name priority", () => {
    it("uses customName when present", () => {
      const result = buildCSV([
        account({
          id: "acc1",
          customName: "My Custom Name",
          plaidAccount: { name: "Plaid Name", officialName: "Official Name" },
        }),
      ]);
      expect(result).toContain("My Custom Name (acc1)");
    });

    it("falls back to plaidAccount.name when customName is null", () => {
      const result = buildCSV([
        account({
          id: "acc1",
          customName: null,
          plaidAccount: { name: "Plaid Name", officialName: "Official Name" },
        }),
      ]);
      expect(result).toContain("Plaid Name (acc1)");
    });

    it("falls back to account id when customName and plaidAccount are both null", () => {
      const result = buildCSV([account({ id: "acc1", customName: null })]);
      expect(result).toContain("acc1 (acc1)");
    });
  });

  describe("CSV escaping", () => {
    it("wraps names containing commas in double quotes", () => {
      const result = buildCSV([
        account({ id: "acc1", customName: "Savings, Primary" }),
      ]);
      expect(result).toContain('"Savings, Primary (acc1)"');
    });

    it("escapes double quotes within names by doubling them", () => {
      const result = buildCSV([
        account({ id: "acc1", customName: 'My "Special" Account' }),
      ]);
      expect(result).toContain('"My ""Special"" Account (acc1)"');
    });

    it("wraps names containing newlines in double quotes", () => {
      const result = buildCSV([
        account({ id: "acc1", customName: "Line1\nLine2" }),
      ]);
      expect(result).toContain('"Line1\nLine2 (acc1)"');
    });
  });

  describe("amount formatting", () => {
    it("converts cents to dollars with two decimal places", () => {
      const lines = buildCSV([
        account({
          id: "acc1",
          customName: "A",
          balanceSnapshots: [{ amount: 1, date: "2025-01-01" }],
        }),
      ]).split("\n");
      expect(lines[1]).toBe("2025-01-01,0.01");
    });

    it("handles negative amounts", () => {
      const lines = buildCSV([
        account({
          id: "acc1",
          customName: "Mortgage",
          balanceSnapshots: [{ amount: -23000000, date: "2025-01-01" }],
        }),
      ]).split("\n");
      expect(lines[1]).toBe("2025-01-01,-230000.00");
    });

    it("handles zero", () => {
      const lines = buildCSV([
        account({
          id: "acc1",
          customName: "A",
          balanceSnapshots: [{ amount: 0, date: "2025-01-01" }],
        }),
      ]).split("\n");
      expect(lines[1]).toBe("2025-01-01,0.00");
    });
  });
});
