import { AccountType } from "@prisma/client";
import { LoaderFunctionArgs, Outlet } from "react-router";

import { Box } from "~/components/Box/Box";
import { Flex } from "~/components/Flex/Flex";
import { Link } from "~/components/Link/Link";
import { getAccountsForUserId } from "~/models/account.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const accounts = await getAccountsForUserId(userId);

  return {
    accounts: accounts.sort((a, b) => a.nickName.localeCompare(b.nickName)),
  };
};

const accountTypes: AccountType[] = [
  "checking",
  "savings",
  "property",
  "investment",
  "credit_card",
  "line_of_credit",
  "mortgage",
  "other",
] as const;

const prettyAccountTypes: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  other: "Other",
  credit_card: "Credit Card",
  investment: "Investment",
  line_of_credit: "Line of Credit",
  mortgage: "Mortgage",
  property: "Property",
} as const;

export default function LinkedAccountsLayout({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Flex gap={32}>
      <nav>
        <Box mb={32}>
          <Link to="new">Create Account</Link>
        </Box>
        {accountTypes.map((type) => (
          <Box key={type}>
            <h3>{prettyAccountTypes[type]}</h3>
            <ul>
              {loaderData.accounts
                .filter((acc) => acc.type === type)
                .map((account) => (
                  <li key={account.id}>
                    <Link to={account.id}>{account.nickName}</Link>
                  </li>
                ))}
            </ul>
          </Box>
        ))}
      </nav>
      <Box>
        <Outlet />
      </Box>
    </Flex>
  );
}
