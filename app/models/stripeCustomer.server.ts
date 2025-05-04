import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export const getStripeCustomerByUserId = (userId: User["id"]) => {
  return prisma.stripeCustomer.findUnique({
    where: {
      userId,
    },
  });
};
