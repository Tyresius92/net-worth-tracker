import { prisma } from "~/db.server";
import { logger } from "~/logger";

import { defaultQueue } from "../queue.server";

const SCHEDULER_ID = "weekly-balance-refresh";
const SCHEDULER_JOB_NAME = "weekly-balance-refresh";
const REFRESH_JOB_NAME = "balance-refresh";
const WEEKLY_CRON = "0 3 * * 0"; // Sunday 3:00 AM UTC

export const registerWeeklyBalanceRefresh = async () => {
  await defaultQueue.upsertJobScheduler(
    SCHEDULER_ID,
    { pattern: WEEKLY_CRON },
    {
      name: SCHEDULER_JOB_NAME,
      opts: { attempts: 1 },
    },
  );

  logger.info("Weekly balance refresh scheduler registered", {
    cron: WEEKLY_CRON,
  });
};

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

  logger.info("Enqueued balance refresh jobs for all healthy items", {
    itemCount: jobs.length,
  });
};
