import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { NetWorthChart } from "~/components/NetWorthChart/Recharts";
import { getAllAccountsAndBalances } from "~/models/account.server";
import { getUser } from "~/session.server";
import { getNormalizedUserNetWorth } from "~/utils/accountUtils";

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
    <div>
      <div
        style={{
          backgroundColor: "blue",
        }}
      >
        <h1
          style={{
            color: "orange",
          }}
        >
          Money Chomp
        </h1>
        <h2 style={{ color: "white" }}>Take a bite out of your finances.</h2>
      </div>
      <div>
        {user ? (
          <div>
            <h3>Hello, {user.firstName}!</h3>
            <NetWorthChart data={summary} />
            <div>
              <pre>{JSON.stringify(summary, undefined, 2)}</pre>
            </div>
          </div>
        ) : (
          <div>
            <h2>Pricing</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <div>
                <h3>Free Plan</h3>
                <p>$0/month. Free forever.</p>
                <p>Enter account information manually</p>
              </div>
              <div>
                <h3>Premium</h3>
                <p>$25/month</p>
                <p>
                  Integrates with Stripe to pull your account balances on a
                  weekly basis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
