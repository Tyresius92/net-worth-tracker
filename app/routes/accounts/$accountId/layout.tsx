import type { LoaderFunctionArgs} from "react-router";
import { Outlet, redirect } from "react-router";
import invariant from "tiny-invariant";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { getUserId, loginRedirect } from "~/session.server";

import type { Route } from "./+types/layout";

export const loader = async ({ params, request, url }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);

  invariant(params.accountId, "Account ID not in URL");
  const accountId = params.accountId;

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
      <Box xsMb={32}>
        <h2>
          {loaderData.account.closedAt ? "CLOSED: " : ""}Account ID:{" "}
          {loaderData.account.id}
        </h2>
        <p>Official Name: {loaderData.account.customName}</p>
        <p>
          Type:{" "}
          {loaderData.account.type
            .replace("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>
      </Box>
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
