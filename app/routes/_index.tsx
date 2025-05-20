import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { Box } from "~/components/Box/Box";
import { getAllAccountsAndBalances } from "~/models/account.server";
import { getUser } from "~/session.server";
import { getNormalizedUserNetWorth } from "~/utils/accountUtils";
import { formatCurrency } from "~/utils/currencyUtils";

import type { Route } from "./+types/_index";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  if (!user) {
    return { user, summary: null };
  }

  const data = await getAllAccountsAndBalances(user.id);

  const summary = getNormalizedUserNetWorth(data);

  return {
    user,
    summary,
  };
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { user, summary } = loaderData;

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
            <h4>Your net worth is {formatCurrency(summary.currentNetWorth)}</h4>
          </Box>
        ) : (
          <Box>
            <h2>Pricing</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <Box>
                <h3>Free Plan</h3>
                <p>$0/month. Free forever.</p>
                <p>Enter account information manually</p>
              </Box>
              <Box>
                <h3>Premium</h3>
                <p>$25/month</p>
                <p>
                  Integrates with Stripe to pull your account balances on a
                  weekly basis.
                </p>
              </Box>
            </div>
          </Box>
        )}
      </Box>
    </div>
  );
}
