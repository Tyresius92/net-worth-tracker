import { PrismaClient } from "@prisma/client";

import { singleton } from "./singleton.server";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton("prisma", () =>
  new PrismaClient().$extends({
    result: {
      user: {
        fullName: {
          needs: { firstName: true, lastName: true },
          compute(user) {
            return `${user.firstName} ${user.lastName}`;
          },
        },
      },
    },
  }),
).$extends({
  result: {
    balanceSnapshot: {
      date: {
        needs: { dateTime: true },
        compute(balanceSnapshot) {
          return balanceSnapshot.dateTime.toISOString().split("T")[0];
        },
      },
    },
  },
});
prisma.$connect();

export { prisma };
