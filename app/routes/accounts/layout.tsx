import { AccountType } from "@prisma/client";
import { LoaderFunctionArgs, Outlet } from "react-router";

import { Box } from "~/components/Box/Box";
import { Flex } from "~/components/Flex/Flex";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { toPrettyAccountType } from "~/utils/accountUtils";

import type { Route } from "./+types/layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accounts = await prisma.account.findMany({
    where: {
      userId,
    },
    include: {
      balanceSnapshots: true,
      plaidAccount: true,
    },
  });

  return {
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

export default function LinkedAccountsLayout({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Flex gap={32}>
      <nav>
        <Box bg="slate-4" p={32}>
          <Flex mb={32} flexDirection="column" gap={16}>
            <Link to="new">Create Account</Link>
            <Link to="new/plaid">Create Account using Plaid</Link>
          </Flex>
          {accountTypes.map((type) => (
            <Box key={type}>
              <h3>{toPrettyAccountType(type)}</h3>
              <ul>
                {loaderData.accounts
                  .filter((acc) => acc.type === type)
                  .map((account) => (
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
          ))}
        </Box>
      </nav>
      <Box py={32}>
        <Outlet />
      </Box>
    </Flex>
  );
}
