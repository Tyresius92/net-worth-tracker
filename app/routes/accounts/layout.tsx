import { AccountType } from "@prisma/client";
import { LoaderFunctionArgs, Outlet } from "react-router";

import { Box } from "~/components/Box/Box";
import { Flex } from "~/components/Flex/Flex";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import { toPrettyAccountType } from "~/utils/accountUtils";

import type { Route } from "./+types/layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const accounts = await prisma.account.findMany({
    where: {
      userId: user.id,
    },
    include: {
      balanceSnapshots: true,
      plaidAccount: true,
    },
  });

  return {
    user,
    accounts: accounts.sort((a, b) => {
      const aName = a.customName ?? a.plaidAccount?.name ?? "[Unnamed Account]";
      const bName = b.customName ?? b.plaidAccount?.name ?? "[Unnamed Account]";

      return aName.localeCompare(bName);
    }),
  };
};

const accountTypes: AccountType[] = [
  "checking",
  "savings",
  "money_market",
  "property",
  "retirement_401k",
  "traditional_ira",
  "roth_ira",
  "credit_card",
  "mortgage",
  "loan",
  "other",
] as const;

const AccountList = ({
  accounts,
  accountType,
}: {
  accounts: Route.ComponentProps["loaderData"]["accounts"];
  accountType: AccountType;
}) => {
  if (accounts.length === 0) {
    return <></>;
  }

  return (
    <Box pl={12}>
      <h3>{toPrettyAccountType(accountType)}</h3>
      <ul>
        {accounts.map((account) => (
          <li key={account.id}>
            <Link to={account.id}>
              {account.customName ??
                account.plaidAccount?.name ??
                "[Unnamed Account]"}
            </Link>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default function LinkedAccountsLayout({
  loaderData,
}: Route.ComponentProps) {
  const openAccounts = loaderData.accounts.filter((acc) => !acc.closedAt);
  const closedAccounts = loaderData.accounts.filter((acc) => acc.closedAt);

  return (
    <Flex gap={32}>
      <nav>
        <Box bg="slate-4" p={32}>
          <Flex mb={32} flexDirection="column" gap={16}>
            <Link to="new">Create Account</Link>
            {loaderData.user.twoFactorEnabled ? (
              <Link to="new/plaid">Create Account using Plaid</Link>
            ) : null}
          </Flex>
          <Box>
            <h2>Open Accounts</h2>
            {accountTypes.map((type) => {
              return (
                <AccountList
                  key={type}
                  accountType={type}
                  accounts={openAccounts.filter((acc) => acc.type === type)}
                />
              );
            })}
          </Box>
          <Box>
            <h2>Closed Accounts</h2>
            {accountTypes.map((type) => {
              return (
                <AccountList
                  key={type}
                  accountType={type}
                  accounts={closedAccounts.filter((acc) => acc.type === type)}
                />
              );
            })}
          </Box>
        </Box>
      </nav>
      <Box py={32}>
        <Outlet />
      </Box>
    </Flex>
  );
}
