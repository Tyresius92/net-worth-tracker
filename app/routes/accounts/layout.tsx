import { LoaderFunctionArgs, Outlet } from "react-router";

import { Box } from "~/components/Box/Box";
import { Flex } from "~/components/Flex/Flex";
import { Link } from "~/components/Link/Link";
import { NavLink } from "~/components/NavLink/NavLink";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import {
  getAccountDisplayName,
  toPrettyAccountType,
} from "~/utils/accountUtils";

import type { Route } from "./+types/layout";
import styles from "./layout.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const accounts = await prisma.account.findMany({
    where: {
      userId: user.id,
    },
    include: {
      plaidAccount: {
        select: {
          id: true,
          name: true,
          officialName: true,
        },
      },
    },
  });

  return {
    user,
    accounts: accounts.sort((a, b) => {
      const aName = getAccountDisplayName(a);
      const bName = getAccountDisplayName(b);

      return aName.localeCompare(bName);
    }),
  };
};

export default function LinkedAccountsLayout({
  loaderData,
}: Route.ComponentProps) {
  const openAccounts = loaderData.accounts.filter((acc) => !acc.closedAt);
  const closedAccounts = loaderData.accounts.filter((acc) => acc.closedAt);

  return (
    <Flex gap={32}>
      <nav className={styles.nav}>
        <div className={styles["create-links"]}>
          <Link to="new">Create Account</Link>
          {loaderData.user.twoFactorEnabled ? (
            <Link to="new/plaid">Create Account using Plaid</Link>
          ) : null}
        </div>
        <div>
          <h2 className={styles["section-heading"]}>Open Accounts</h2>
          <ul className={styles["account-list"]}>
            {openAccounts.map((account) => (
              <li key={account.id} className={styles["account-item"]}>
                <NavLink to={account.id} preventScrollReset>
                  {getAccountDisplayName(account)}
                  <div className={styles["account-meta"]}>
                    {toPrettyAccountType(account.type)} ·{" "}
                    {account.plaidAccount ? "Linked with Plaid" : "Manual"}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        {closedAccounts.length ? (
          <div>
            <h2 className={styles["section-heading"]}>Closed Accounts</h2>
            <ul className={styles["account-list"]}>
              {closedAccounts.map((account) => (
                <li key={account.id} className={styles["account-item"]}>
                  <NavLink to={account.id} preventScrollReset>
                    {getAccountDisplayName(account)}
                  </NavLink>
                  <div className={styles["account-meta"]}>
                    {toPrettyAccountType(account.type)} ·{" "}
                    {account.plaidAccount ? "Plaid" : "Manual"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>
      <Box px={32} py={32}>
        <Outlet />
      </Box>
    </Flex>
  );
}
