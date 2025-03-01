import { PrismaClient } from "@prisma/client";

import { singleton } from "./singleton.server";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton(
  "prisma",
  () =>
    new PrismaClient({
      omit: {
        plaidItem: {
          accessToken: true,
        },
      },
    }).$extends({
      result: {
        accountBalance: {
          date: {
            needs: { snapshotDatetime: true },
            compute(balance) {
              return balance.snapshotDatetime.toISOString().slice(0, 10)
            },
          }
        }
      }
    }),
);
prisma.$connect();

export { prisma };
