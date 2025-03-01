import { prisma } from "~/db.server";
import { plaidClient } from "~/plaid";

export const refreshAccountBalances = async () => {
  const plaidItems = await prisma.plaidItem.findMany({
    select: {
      id: true,
      accessToken: true,
      accounts: true,
    },
  });

  console.log(
    `${new Date().toISOString()}: found ${plaidItems.length} Plaid Items`,
  );

  plaidItems.forEach(async (item) => {
    console.log(
      `${new Date().toISOString()}: refreshing Plaid Item ${item.id}`,
    );
    try {
      const plaidAccounts = await plaidClient.accountsGet({
        access_token: item.accessToken,
      });

      const accountsFromResponse = plaidAccounts.data.accounts;

      await Promise.all(
        item.accounts.map(async (dbAccount) => {
          const accountDict = accountsFromResponse.find(
            (responseAcc) =>
              (responseAcc.persistent_account_id ?? responseAcc.account_id) ===
              dbAccount.plaidAccountId,
          );

          const currentBalance = accountDict?.balances.current ?? 0;
          const accountType = accountDict?.type ?? "depository";
          const normalizedBalance = ["credit", "loan"].includes(accountType)
            ? currentBalance * -1
            : currentBalance;

          const balance = await prisma.accountBalance.create({
            data: {
              accountId: dbAccount.id,
              snapshotDatetime: new Date(new Date().setUTCHours(0, 0, 0, 0)),
              amount: normalizedBalance,
            },
          });

          console.log(
            `${new Date().toISOString()}: newBalance for Plaid Item ${item.id}`,
          );

          return balance;
        }),
      );
    } catch (e: unknown) {
      console.log(
        `${new Date().toISOString()}: something went wrong calling accountsGet for PlaidItem ${item.id}: ${e}`,
      );
    }

    console.log(`${new Date().toISOString()}: job complete`);
  });
};
