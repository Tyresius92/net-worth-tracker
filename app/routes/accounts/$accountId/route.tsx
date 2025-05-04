import { LoaderFunctionArgs } from "react-router";

import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  return { userId };
};

export default function AccountDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <div
        style={{
          paddingBlock: 50,
        }}
      >
        <h3>User ID: {loaderData.userId}</h3>
      </div>
    </div>
  );
}
