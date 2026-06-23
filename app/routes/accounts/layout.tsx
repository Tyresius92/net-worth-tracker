import { LoaderFunctionArgs, Outlet } from "react-router";

import { Box } from "~/components/Box/Box";
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

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const user = await requireUser(request, url);

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
    <Box display="flex" xsGap={32}>
      <nav aria-label="Sources" className={styles.nav}>
        <div className={styles["create-links"]}>
          <Link to="new">Add a source</Link>
          {loaderData.user.twoFactorEnabled ? (
            <Link to="new/plaid">Add a wire service</Link>
          ) : null}
        </div>
        <div>
          <h2 className={styles["section-heading"]}>Open sources</h2>
          <ul className={styles["account-list"]}>
            {openAccounts.map((account) => (
              <li key={account.id} className={styles["account-item"]}>
                <NavLink to={account.id} preventScrollReset>
                  {getAccountDisplayName(account)}
                  <div className={styles["account-meta"]}>
                    {toPrettyAccountType(account.type)} ·{" "}
                    {account.plaidAccount ? "Wire service" : "Staff-reported"}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        {closedAccounts.length ? (
          <div>
            <h2 className={styles["section-heading"]}>Closed sources</h2>
            <ul className={styles["account-list"]}>
              {closedAccounts.map((account) => (
                <li key={account.id} className={styles["account-item"]}>
                  <NavLink to={account.id} preventScrollReset>
                    {getAccountDisplayName(account)}
                  </NavLink>
                  <div className={styles["account-meta"]}>
                    {toPrettyAccountType(account.type)} ·{" "}
                    {account.plaidAccount ? "Wire service" : "Staff-reported"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>
      <Box xsPx={32} xsPy={32}>
        <Outlet />
      </Box>
    </Box>
  );
}
