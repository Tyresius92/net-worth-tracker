import { schedule } from "node-cron";

import { prisma } from "~/db.server";
import { logger } from "~/logger";

import { redisConnection } from "../connection.server";
import { defaultQueue } from "../queue.server";

const LAST_RUN_KEY = "balance_refresh:last_run_at";
const REFRESH_JOB_NAME = "balance-refresh";
const WEEKLY_CRON = "0 3 * * 0"; // Sunday 3:00 AM UTC
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const enqueueAllHealthyItems = async () => {
  const plaidItems = await prisma.plaidItem.findMany({
    select: { plaidItemId: true },
    where: {
      status: "healthy",
      user: { twoFactorEnabled: true },
    },
  });

  const jobs = plaidItems.map((item) => ({
    name: REFRESH_JOB_NAME,
    data: { plaidItemId: item.plaidItemId },
    opts: {
      attempts: 3,
      backoff: { type: "exponential" as const, delay: 5000 },
    },
  }));

  if (jobs.length > 0) {
    await defaultQueue.addBulk(jobs);
  }

  await redisConnection.set(LAST_RUN_KEY, Date.now().toString());

  logger.info("Enqueued balance refresh jobs for all healthy items", {
    itemCount: jobs.length,
  });
};

export const startWeeklyBalanceRefreshCron = async () => {
  const lastRunAt = await redisConnection.get(LAST_RUN_KEY);

  if (!lastRunAt || Date.now() - parseInt(lastRunAt, 10) > SEVEN_DAYS_MS) {
    logger.info("Balance refresh is stale — running on startup");
    await enqueueAllHealthyItems();
  }

  schedule(WEEKLY_CRON, async () => {
    logger.info("Weekly balance refresh cron fired");
    await enqueueAllHealthyItems();
  });

  logger.info("Weekly balance refresh cron registered", { cron: WEEKLY_CRON });
};
