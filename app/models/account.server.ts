import type { User, Account } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Account };

export const getAccountsForUserId = (userId: User["id"]) => {
  return prisma.account.findMany({
    where: {
      userId,
    },
    include: {
      balanceSnapshots: true,
    },
  });
};

export async function getAllAccountsAndBalances(userId: User["id"]) {
  return prisma.account.findMany({
    where: { userId },
    include: {
      balanceSnapshots: {
        orderBy: { dateTime: "asc" },
        take: 100000,
      },
    },
  });
}
