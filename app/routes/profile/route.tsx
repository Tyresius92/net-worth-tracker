import { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      accounts: {
        where: {
          closedAt: null,
        },
        include: {
          balanceSnapshots: {
            take: 1,
            orderBy: {
              dateTime: "desc",
            },
          },
        },
      },
    },
  });

  return {
    user,
  };
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  const netWorth = loaderData.user.accounts.reduce((accumulator, account) => {
    const snap = account.balanceSnapshots[0];

    if (!snap) {
      return accumulator;
    }

    return accumulator + snap.amount;
  }, 0);

  return (
    <Box px={32}>
      <h1>{loaderData.user.fullName}&apos;s Profile</h1>
      <p>Your Net Worth: {formatCurrency(netWorth)}</p>
    </Box>
  );
}
