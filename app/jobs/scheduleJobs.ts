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

  console.log(`asdf found ${plaidItems.length} Plaid Items`)

  plaidItems.forEach(async (item) => {
    console.log(`asdf refreshing Plaid Item ${item.id}`)

    const plaidAccounts = await plaidClient.accountsGet({
      access_token: item.accessToken,
    });

    const accountsFromResponse = plaidAccounts.data.accounts;

    await Promise.all(item.accounts.map(async (dbAccount) => {
      const accountDict = accountsFromResponse.find(
        (responseAcc) =>
          (responseAcc.persistent_account_id ?? responseAcc.account_id) ===
          dbAccount.plaidAccountId,
      );

      const balance = await prisma.accountBalance.create({
        data: {
          accountId: dbAccount.id,
          date: new Date(),
          amount: (accountDict?.balances.current ?? 0) * 100,
        },
      });

      console.log(`asdf newBalance for Plaid Item ${item.id}`)

      return balance
    }));

    console.log(`asdf job complete`)
  });
}

