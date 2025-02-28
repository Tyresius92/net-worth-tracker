import { ActionFunction, data } from "react-router";

import { refreshAccountBalances } from "~/jobs/scheduleJobs";

export const action: ActionFunction = async () => {
  console.log(`${new Date().toISOString()}: refreshing account balances`);
  await refreshAccountBalances();

  return data({ok: true})
};
