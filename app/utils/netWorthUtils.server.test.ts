import { describe, it, expect } from "vitest";

import { getUserNetWorth } from "./netWorthUtils.server";

const snap = (id: string, amount: number) => ({ id, amount });
const account = (id: string, amounts: number[]) => ({
  id,
  balanceSnapshots: amounts.map((a, i) => snap(`${id}-snap-${i}`, a)),
});

describe("getUserNetWorth", () => {
  it("returns 0 for an empty accounts array", () => {
    expect(getUserNetWorth([])).toBe(0);
  });

  it("returns 0 for accounts with no snapshots", () => {
    expect(getUserNetWorth([account("a", []), account("b", [])])).toBe(0);
  });

  it("sums the first snapshot from each account", () => {
    expect(getUserNetWorth([account("a", [10_000]), account("b", [5_000])])).toBe(15_000);
  });

  it("uses only the first snapshot, ignoring the rest", () => {
    // callers order snapshots desc so index 0 is the most recent;
    // the function must not sum all snapshots, only index 0
    expect(getUserNetWorth([account("a", [10_000, 7_000, 3_000])])).toBe(10_000);
  });

  it("handles negative amounts (e.g. credit cards, mortgages)", () => {
    expect(
      getUserNetWorth([account("checking", [50_000]), account("mortgage", [-200_000])]),
    ).toBe(-150_000);
  });

  it("skips accounts with no snapshots while summing the rest", () => {
    expect(
      getUserNetWorth([account("a", [10_000]), account("b", []), account("c", [5_000])]),
    ).toBe(15_000);
  });
});
