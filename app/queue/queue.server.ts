import { Queue } from "bullmq";

import { singleton } from "~/singleton.server";

import { redisConnection } from "./connection.server";

export const defaultQueue = singleton(
  "defaultQueue",
  () =>
    new Queue("default", {
      connection: redisConnection,
    }),
);
