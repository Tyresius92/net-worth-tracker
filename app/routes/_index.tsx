import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { getUser } from "~/session.server";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/_index";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  if (!user) {
    return { user, netWorth: null };
  }

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: user.id,
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
    netWorth: userData.accounts.reduce((accumulator, account) => {
      const snap = account.balanceSnapshots[0];

      if (!snap) {
        return accumulator;
      }

      return accumulator + snap.amount;
    }, 0)
  };
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { user, netWorth } = loaderData;

  return (
    <div
      style={{
        minHeight: "100%",
      }}
    >
      <Box>
        <h1
          style={{
            color: "var(--color-orange-9)",
          }}
        >
          Money Chomp
        </h1>
        <h2 style={{ color: "var(--color-slate-12)" }}>
          Take a bite out of your finances.
        </h2>
      </Box>
      <Box>
        {user ? (
          <Box>
            <h3>Hello, {user.firstName}!</h3>
            <h4>Your net worth is {formatCurrency(netWorth)}</h4>
          </Box>
        ) : null}
      </Box>
    </div>
  );
}
