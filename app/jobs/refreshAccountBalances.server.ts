import { prisma } from "~/db.server";
import { logger } from "~/logger";
import { plaidClient } from "~/plaid";

export const refreshAccountBalances = async (options?: {
  plaidItemId?: string;
}) => {
  const plaidItems = await prisma.plaidItem.findMany({
    select: {
      id: true,
      accessToken: true,
      plaidAccounts: {
        select: {
          id: true,
          plaidAccountId: true,
          account: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    where: {
      status: "healthy",
      user: { twoFactorEnabled: true },
      ...(options?.plaidItemId ? { plaidItemId: options.plaidItemId } : {}),
    },
  });

  logger.info("Balance refresh job started", { itemCount: plaidItems.length });

  const results = await Promise.allSettled(
    plaidItems.map(async (item) => {
      logger.info("Refreshing Plaid item", { itemId: item.id });

      try {
        const plaidAccounts = await plaidClient.accountsGet({
          access_token: item.accessToken,
        });

        const accountsFromResponse = plaidAccounts.data.accounts;

        await Promise.all(
          item.plaidAccounts.map(async (dbAccount) => {
            const accountDict = accountsFromResponse.find(
              (responseAcc) =>
                (responseAcc.persistent_account_id ??
                  responseAcc.account_id) === dbAccount.plaidAccountId,
            );

            const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
            const existing = await prisma.balanceSnapshot.findFirst({
              where: { accountId: dbAccount.account.id, dateTime: today },
            });
            if (existing) {
              return existing;
            }

            const currentBalance = accountDict?.balances.current ?? 0;
            const accountType = accountDict?.type ?? "other";
            const normalizedBalance = ["credit", "loan"].includes(accountType)
              ? currentBalance * -1
              : currentBalance;

            const balance = await prisma.balanceSnapshot.create({
              data: {
                accountId: dbAccount.account.id,
                dateTime: today,
                amount: normalizedBalance * 100,
              },
            });

            logger.info("Balance snapshot created", {
              itemId: item.id,
              accountId: dbAccount.account.id,
            });

            return balance;
          }),
        );
      } catch (err) {
        logger.error(err instanceof Error ? err : new Error(String(err)), {
          itemId: item.id,
        });
        throw err;
      }
    }),
  );

  const failures = results.filter(
    (r): r is PromiseRejectedResult => r.status === "rejected",
  );

  logger.info("Balance refresh job complete", {
    succeeded: results.length - failures.length,
    failed: failures.length,
    total: results.length,
  });
};
