import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProcessableJob } from "./worker.server";

const mockRefreshAccountBalances = vi.fn().mockResolvedValue(undefined);

vi.mock("~/jobs/refreshAccountBalances.server", () => ({
  refreshAccountBalances: mockRefreshAccountBalances,
}));

vi.mock("../connection.server", () => ({
  redisConnection: {},
}));

vi.mock("~/singleton.server", () => ({
  singleton: (_name: string, factory: () => unknown) => factory(),
}));

vi.mock("bullmq", () => {
  class MockWorker {
    on = vi.fn();
  }
  return { Worker: MockWorker, Queue: vi.fn() };
});

const { processJob } = await import("./worker.server");

beforeEach(() => {
  mockRefreshAccountBalances.mockClear();
});

const makeJob = (name: string, data: unknown = {}): ProcessableJob => ({
  id: "test-job-id",
  name,
  data,
});

describe("processJob", () => {
  it("calls refreshAccountBalances with the plaidItemId for balance-refresh jobs", async () => {
    await processJob(
      makeJob("balance-refresh", { plaidItemId: "plaid-item-123" }),
    );

    expect(mockRefreshAccountBalances).toHaveBeenCalledWith({
      plaidItemId: "plaid-item-123",
    });
  });

  it("does not call refreshAccountBalances when job data is missing plaidItemId", async () => {
    await processJob(makeJob("balance-refresh", {}));

    expect(mockRefreshAccountBalances).not.toHaveBeenCalled();
  });

  it("does not call refreshAccountBalances when plaidItemId is not a string", async () => {
    await processJob(makeJob("balance-refresh", { plaidItemId: 42 }));

    expect(mockRefreshAccountBalances).not.toHaveBeenCalled();
  });

  it("does not throw for unknown job names", async () => {
    await expect(processJob(makeJob("unknown-job"))).resolves.toBeUndefined();
  });
});
