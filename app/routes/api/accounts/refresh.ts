import { ActionFunction } from "react-router";

import { refreshAccountBalances } from "~/jobs/refreshAccountBalances.server";

export const action: ActionFunction = async ({ request }) => {
  if (
    request.headers.get("Authorization") !== process.env["REFRESH_API_SECRET"]
  ) {
    return Response.json({ ok: false }, { status: 403 });
  }
  console.log(`${new Date().toISOString()}: refreshing account balances`);
  await refreshAccountBalances();

  return Response.json({ ok: true });
};
