import type { User, Account } from "@prisma/client";

import { prisma } from "~/db.server";

export type {Account}

export const getAccountsForUserId = (userId: User['id']) => {
  return prisma.account.findMany({
    where: {
      userId,
    },
    include: {
      balanceSnapshots: true
    }
  })
}