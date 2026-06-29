import { Worker } from "bullmq";

import { refreshAccountBalances } from "~/jobs/refreshAccountBalances.server";
import { logger } from "~/logger";
import { singleton } from "~/singleton.server";

import { redisConnection } from "../connection.server";

import { enqueueAllHealthyItems } from "./scheduler.server";

interface BalanceRefreshJobData {
  plaidItemId: string;
}

const isBalanceRefreshJob = (data: unknown): data is BalanceRefreshJobData =>
  typeof data === "object" &&
  data !== null &&
  "plaidItemId" in data &&
  typeof data.plaidItemId === "string";

export interface ProcessableJob {
  id?: string;
  name: string;
  data: unknown;
}

export const processJob = async (job: ProcessableJob) => {
  switch (job.name) {
    case "weekly-balance-refresh":
      await enqueueAllHealthyItems();
      break;
    case "balance-refresh": {
      if (!isBalanceRefreshJob(job.data)) {
        logger.warn("Invalid balance-refresh job data", {
          jobId: job.id,
        });
        return;
      }
      logger.info("Processing balance refresh job", {
        jobId: job.id,
        plaidItemId: job.data.plaidItemId,
      });
      await refreshAccountBalances({
        plaidItemId: job.data.plaidItemId,
      });
      break;
    }
    default:
      logger.warn("Unknown job name received", {
        jobId: job.id,
        jobName: job.name,
      });
  }
};

export const balanceRefreshWorker = singleton(
  "balanceRefreshWorker",
  () =>
    new Worker("default", processJob, {
      connection: redisConnection,
      limiter: { max: 1, duration: 10_000 },
      concurrency: 1,
      drainDelay: 60,
      stalledInterval: 300_000,
    }),
);

balanceRefreshWorker.on("failed", (job, error) => {
  logger.error(error, {
    jobId: job?.id,
    jobName: job?.name,
    attemptsMade: job?.attemptsMade,
  });
});
