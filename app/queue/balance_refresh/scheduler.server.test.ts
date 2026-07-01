import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlaidItemFactory } from "~/factories/plaidItemFactory";
import { UserFactory } from "~/factories/userFactory";

interface EnqueuedJob {
  name: string;
  data: { plaidItemId: string };
  opts: { attempts: number; backoff: { type: string; delay: number } };
}

const mockSchedule = vi.fn();
const mockRedisGet = vi
  .fn<() => Promise<string | null>>()
  .mockResolvedValue(null);
const mockRedisSet = vi.fn().mockResolvedValue("OK");
const mockAddBulk = vi
  .fn<(jobs: EnqueuedJob[]) => Promise<never[]>>()
  .mockResolvedValue([]);

vi.mock("node-cron", () => ({
  schedule: mockSchedule,
}));

vi.mock("../connection.server", () => ({
  redisConnection: {
    get: mockRedisGet,
    set: mockRedisSet,
  },
}));

vi.mock("../queue.server", () => ({
  defaultQueue: {
    addBulk: mockAddBulk,
  },
}));

const { startWeeklyBalanceRefreshCron, enqueueAllHealthyItems } =
  await import("./scheduler.server");

beforeEach(() => {
  mockSchedule.mockClear();
  mockRedisGet.mockClear().mockResolvedValue(null);
  mockRedisSet.mockClear();
  mockAddBulk.mockClear();
});

const getEnqueuedPlaidItemIds = (): string[] =>
  mockAddBulk.mock.calls.flatMap((call) =>
    call[0].map((job) => job.data.plaidItemId),
  );

describe("startWeeklyBalanceRefreshCron", () => {
  it("runs enqueueAllHealthyItems on startup when Redis has no last-run key", async () => {
    mockRedisGet.mockResolvedValue(null);

    await startWeeklyBalanceRefreshCron();

    expect(mockRedisSet).toHaveBeenCalledWith(
      "balance_refresh:last_run_at",
      expect.any(String),
    );
  });

  it("runs enqueueAllHealthyItems on startup when last run was more than 7 days ago", async () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    mockRedisGet.mockResolvedValue(eightDaysAgo.toString());

    await startWeeklyBalanceRefreshCron();

    expect(mockRedisSet).toHaveBeenCalledWith(
      "balance_refresh:last_run_at",
      expect.any(String),
    );
  });

  it("does not run enqueueAllHealthyItems on startup when last run was recent", async () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    mockRedisGet.mockResolvedValue(oneHourAgo.toString());

    await startWeeklyBalanceRefreshCron();

    expect(mockRedisSet).not.toHaveBeenCalled();
  });

  it("registers a weekly cron with the correct schedule", async () => {
    await startWeeklyBalanceRefreshCron();

    expect(mockSchedule).toHaveBeenCalledWith(
      "0 3 * * 0",
      expect.any(Function),
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

  it("records the run timestamp in Redis", async () => {
    await enqueueAllHealthyItems();

    expect(mockRedisSet).toHaveBeenCalledWith(
      "balance_refresh:last_run_at",
      expect.any(String),
    );
  });
});
