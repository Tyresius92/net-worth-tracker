import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { NetWorthChart } from "~/components/NetWorthChart/NetWorthChart";
import { prisma } from "~/db.server";
import { getUser } from "~/session.server";

import type { Route } from "./+types/_index";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  if (user) {
    const userAccounts = await prisma.account.findMany({
      include: {
        balances: {
          orderBy: {
            snapshotDatetime: "asc",
          },
        },
      },
      where: {
        userId: user.id,
      },
    });

    return {
      user,
      userAccounts,
    };
  }

  return {
    user,
  };
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { user, userAccounts } = loaderData;

  return (
    <>
      <div>Hello world!</div>
      <pre>{JSON.stringify(user ?? {}, undefined, 2)}</pre>
      <div
        style={{
          maxWidth: 1000,
        }}
      >
        {userAccounts?.length ? (
          <NetWorthChart accounts={userAccounts} />
        ) : null}
      </div>
    </>
  );
}
