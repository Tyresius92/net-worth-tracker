import { ActionFunction } from "react-router";

import { refreshAccountBalances } from "~/jobs/refreshAccountBalances.server";

export const action: ActionFunction = async () => {
  console.log(`${new Date().toISOString()}: refreshing account balances`);
  await refreshAccountBalances();

  return Response.json({ ok: true });
};
