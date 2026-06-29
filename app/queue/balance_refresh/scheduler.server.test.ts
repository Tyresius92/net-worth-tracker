import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlaidItemFactory } from "~/factories/plaidItemFactory";
import { UserFactory } from "~/factories/userFactory";

interface EnqueuedJob {
  name: string;
  data: { plaidItemId: string };
  opts: { attempts: number; backoff: { type: string; delay: number } };
}

const mockUpsertJobScheduler = vi.fn().mockResolvedValue(undefined);
const mockAddBulk = vi
  .fn<(jobs: EnqueuedJob[]) => Promise<never[]>>()
  .mockResolvedValue([]);

vi.mock("../queue.server", () => ({
  defaultQueue: {
    upsertJobScheduler: mockUpsertJobScheduler,
    addBulk: mockAddBulk,
  },
}));

const { registerWeeklyBalanceRefresh, enqueueAllHealthyItems } = await import(
  "./scheduler.server"
);

beforeEach(() => {
  mockUpsertJobScheduler.mockClear();
  mockAddBulk.mockClear();
});

const getEnqueuedPlaidItemIds = (): string[] =>
  mockAddBulk.mock.calls.flatMap((call) =>
    call[0].map((job) => job.data.plaidItemId),
  );

describe("registerWeeklyBalanceRefresh", () => {
  it("registers a weekly cron job scheduler", async () => {
    await registerWeeklyBalanceRefresh();

    expect(mockUpsertJobScheduler).toHaveBeenCalledWith(
      "weekly-balance-refresh",
      { pattern: "0 3 * * 0" },
      expect.objectContaining({
        name: "weekly-balance-refresh",
      }),
    );
  });
});

describe("enqueueAllHealthyItems", () => {
  it("enqueues a job for each healthy PlaidItem with 2FA enabled", async () => {
    const user = await UserFactory.createForConnect();
    const item1 = await PlaidItemFactory.create({
      user: { connect: user },
      status: "healthy",
    });
    const item2 = await PlaidItemFactory.create({
      user: { connect: user },
      status: "healthy",
    });

    await enqueueAllHealthyItems();

    const enqueuedIds = getEnqueuedPlaidItemIds();
    expect(enqueuedIds).toContain(item1.plaidItemId);
    expect(enqueuedIds).toContain(item2.plaidItemId);
  });

  it("does not enqueue unhealthy PlaidItems", async () => {
    const user = await UserFactory.createForConnect();
    const unhealthyItem = await PlaidItemFactory.create({
      user: { connect: user },
      status: "unhealthy",
    });

    await enqueueAllHealthyItems();

    const enqueuedIds = getEnqueuedPlaidItemIds();
    expect(enqueuedIds).not.toContain(unhealthyItem.plaidItemId);
  });

  it("does not enqueue items belonging to users without 2FA enabled", async () => {
    const userWithout2fa = await UserFactory.createForConnect({
      twoFactorEnabled: false,
    });
    const ineligibleItem = await PlaidItemFactory.create({
      user: { connect: userWithout2fa },
      status: "healthy",
    });

    await enqueueAllHealthyItems();

    const enqueuedIds = getEnqueuedPlaidItemIds();
    expect(enqueuedIds).not.toContain(ineligibleItem.plaidItemId);
  });

  it("sets retry config with exponential backoff on each job", async () => {
    const user = await UserFactory.createForConnect();
    const item = await PlaidItemFactory.create({
      user: { connect: user },
      status: "healthy",
    });

    await enqueueAllHealthyItems();

    expect(mockAddBulk).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          data: { plaidItemId: item.plaidItemId },
          opts: {
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 },
          },
        }),
      ]),
    );
  });
});
