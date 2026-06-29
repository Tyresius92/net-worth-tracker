import IORedis from "ioredis";

import { singleton } from "~/singleton.server";

export const redisConnection = singleton("redis", () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is required");
  }

  return new IORedis(url, { maxRetriesPerRequest: null });
});
