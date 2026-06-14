import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { Box } from "~/components/Box/Box";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

import styles from "./user-detail.module.css";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const currentUser = await requireUser(request);
  if (currentUser.role !== "admin") {throw redirect("/");}

  invariant(params.userId, "userId is required");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: params.userId },
    include: {
      accounts: {
        select: {
          id: true,
          customName: true,
          type: true,
          closedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      plaidItems: {
        select: {
          id: true,
          institutionName: true,
          status: true,
          createdAt: true,
          plaidAccounts: { select: { id: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return { user };
};

export default function AdminUserDetailPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/users">← All users</Link>
        <h1 className={styles.heading}>
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Account Info</p>
        <Box borderColor="sand-7">
          <div className={styles.row}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{user.email}</span>
          </div>
          <Divider variant="light" />
          <div className={styles.row}>
            <span className={styles.label}>Role</span>
            <span className={styles.value}>{user.role}</span>
          </div>
          <Divider variant="light" />
          <div className={styles.row}>
            <span className={styles.label}>Member since</span>
            <span className={styles.value}>
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <Divider variant="light" />
          <div className={styles.row}>
            <span className={styles.label}>Two-factor authentication</span>
            <span className={styles.value}>
              {user.twoFactorEnabled ? "Enabled" : "Not enabled"}
            </span>
          </div>
        </Box>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>
          Accounts ({user.accounts.length})
        </p>
        <Box borderColor="sand-7">
          {user.accounts.length === 0 ? (
            <div className={styles.empty}>No accounts.</div>
          ) : (
            user.accounts.map((account, i) => (
              <div key={account.id}>
                {i > 0 ? <Divider variant="light" /> : null}
                <div className={styles.row}>
                  <span className={styles.label}>
                    {account.customName ?? "(unnamed)"}
                  </span>
                  <span className={styles.value}>
                    {account.type}
                    {account.closedAt ? " · closed" : null}
                  </span>
                </div>
              </div>
            ))
          )}
        </Box>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>
          Plaid Connections ({user.plaidItems.length})
        </p>
        <Box borderColor="sand-7">
          {user.plaidItems.length === 0 ? (
            <div className={styles.empty}>No Plaid connections.</div>
          ) : (
            user.plaidItems.map((item, i) => (
              <div key={item.id}>
                {i > 0 ? <Divider variant="light" /> : null}
                <div className={styles.row}>
                  <span className={styles.label}>{item.institutionName}</span>
                  <span className={styles.value}>
                    {item.plaidAccounts.length} account
                    {item.plaidAccounts.length !== 1 ? "s" : ""} · {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </Box>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Danger Zone</p>
        <Box borderColor="red-7">
          <div className={styles.row}>
            <span className={styles.label}>
              Permanently delete this account and all associated data
            </span>
            <span className={styles.value}>
              <Link to={`/users/${user.id}/delete`}>Delete account</Link>
            </span>
          </div>
        </Box>
      </div>
    </div>
  );
}
