import { describe, expect, it } from "vitest";

import { computeSourceCounts } from "./route";

const account = (overrides: {
  closedAt?: Date | null;
  plaidAccount?: { id: string } | null;
}) => ({
  closedAt: null,
  plaidAccount: null,
  ...overrides,
});

describe("computeSourceCounts", () => {
  it("returns zeros for an empty accounts list", () => {
    expect(computeSourceCounts([])).toEqual({
      wireSources: 0,
      staffReportedSources: 0,
      closedSources: 0,
    });
  });

  it("counts wire and staff-reported active sources correctly", () => {
    const accounts = [
      account({ plaidAccount: { id: "p1" } }),
      account({ plaidAccount: { id: "p2" } }),
      account({ plaidAccount: null }),
      account({ plaidAccount: null }),
      account({ plaidAccount: null }),
    ];
    expect(computeSourceCounts(accounts)).toEqual({
      wireSources: 2,
      staffReportedSources: 3,
      closedSources: 0,
    });
  });

  it("counts closed sources and excludes them from active counts", () => {
    const accounts = [
      account({ closedAt: new Date(), plaidAccount: { id: "p1" } }),
      account({ closedAt: new Date(), plaidAccount: null }),
    ];
    expect(computeSourceCounts(accounts)).toEqual({
      wireSources: 0,
      staffReportedSources: 0,
      closedSources: 2,
    });
  });

  it("separates active wire from a closed wire source", () => {
    const accounts = [
      account({ closedAt: new Date(), plaidAccount: { id: "p1" } }),
      account({ plaidAccount: null }),
    ];
    expect(computeSourceCounts(accounts)).toEqual({
      wireSources: 0,
      staffReportedSources: 1,
      closedSources: 1,
    });
  });

  it("handles a mix of active and closed sources of both types", () => {
    const accounts = [
      account({ plaidAccount: { id: "p1" } }),
      account({ plaidAccount: null }),
      account({ closedAt: new Date(), plaidAccount: { id: "p2" } }),
      account({ closedAt: new Date(), plaidAccount: null }),
    ];
    expect(computeSourceCounts(accounts)).toEqual({
      wireSources: 1,
      staffReportedSources: 1,
      closedSources: 2,
    });
  });
});
