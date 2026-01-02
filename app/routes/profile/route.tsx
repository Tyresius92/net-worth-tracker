import { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";
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
    netWorth: user.accounts.reduce((accumulator, account) => {
      const snap = account.balanceSnapshots[0];

      if (!snap) {
        return accumulator;
      }

      return accumulator + snap.amount;
    }, 0),
  };
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <h1>{loaderData.user.fullName}&apos;s Profile</h1>
      <p>Your Net Worth: {formatCurrency(loaderData.netWorth)}</p>

      {loaderData.user.twoFactorEnabled ? (
        <Box>
          <h2>2FA is enabled</h2>
        </Box>
      ) : (
        <Box>
          <h2>2FA not enabled</h2>
          <p>You do not have two factor authentication enabled.</p>
          <p>2FA is required to pull account information in with Plaid.</p>
          <Link to="./enable_mfa">Set up 2FA</Link>
        </Box>
      )}
    </Box>
  );
}
