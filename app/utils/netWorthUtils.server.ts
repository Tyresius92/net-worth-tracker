import { Account, BalanceSnapshot } from "@prisma/client";

export const getUserNetWorth = (
  accounts: {
    id: Account["id"];
    balanceSnapshots: {
      id: BalanceSnapshot["id"];
      amount: BalanceSnapshot["amount"];
    }[];
  }[],
): number => {
  return accounts.reduce((accumulator, account) => {
    const snap = account.balanceSnapshots[0];

    if (!snap) {
      return accumulator;
    }

    return accumulator + snap.amount;
  }, 0);
};
