import { LoaderFunctionArgs } from "react-router";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const account = await prisma.account.findFirst({
    select: {
      id: true,
      nickName: true,
      officialName: true,
      plaidAccountId: true,
      balances: {
        select: {
          id: true,
          amount: true,
          date: true,
        },
      },
    },
    where: {
      id: accountId,
      userId,
    },
  });

  return { account };
};

export default function AccountDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <pre>{JSON.stringify(loaderData, undefined, 2)}</pre>
    </div>
  );
}
