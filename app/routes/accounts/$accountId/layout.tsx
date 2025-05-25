import { LoaderFunctionArgs, Outlet, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/layout";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    include: {
      balanceSnapshots: true,
    },
  });

  if (!account) {
    return redirect("./..");
  }

  return { userId, account };
};

export default function AccountIdLayout({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <Box mb={48}>
        <h3>User ID: {loaderData.userId}</h3>
      </Box>
      <Box my={48}>
        <h2>Account ID: {loaderData.account.id}</h2>
        <p>Official Name: {loaderData.account.officialName}</p>
        <p>Nickname: {loaderData.account.nickName}</p>
      </Box>
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
