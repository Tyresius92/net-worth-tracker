import { PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";

import { singleton } from "./singleton.server";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton("prisma", () =>
  new PrismaClient({
    omit: {
      plaidItem: {
        accessToken: true,
      },
    },
  })
    .$extends(fieldEncryptionExtension())
    .$extends({
      name: "ComputeBalanceSnapshotDateExtension",
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
    })
    .$extends({
      name: "ComputeFullNameExtension",
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
);

prisma.$connect();

export { prisma };
