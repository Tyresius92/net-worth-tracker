import { ActionFunction } from "react-router";


export const action: ActionFunction = async () => {
  console.log(`${new Date().toISOString()}: no longer refreshing account balances`);

  return Response.json({ ok: true });
};
