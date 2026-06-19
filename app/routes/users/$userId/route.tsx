import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, redirect, useNavigation } from "react-router";
import invariant from "tiny-invariant";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import { formatDate } from "~/utils/dateUtils";

import type { Route } from "./+types/route";
import styles from "./user-detail.module.css";

const VALID_ROLES = ["admin", "customer"] as const;

const isValidRole = (value: unknown): value is "admin" | "customer" =>
  typeof value === "string" &&
  VALID_ROLES.includes(value as (typeof VALID_ROLES)[number]);

export const validateRoleChange = ({
  currentUserId,
  targetUserId,
  targetCurrentRole,
  newRole,
  adminCount,
}: {
  currentUserId: string;
  targetUserId: string;
  targetCurrentRole: string;
  newRole: string;
  adminCount: number;
}): { valid: true } | { valid: false; error: string } => {
  if (!isValidRole(newRole)) {
    return { valid: false, error: "Invalid role." };
  }

  if (currentUserId === targetUserId) {
    return { valid: false, error: "You cannot change your own role." };
  }

  if (targetCurrentRole === "admin" && newRole === "customer" && adminCount === 1) {
    return {
      valid: false,
      error: "This is the only administrator and cannot be demoted.",
    };
  }

  return { valid: true };
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const currentUser = await requireUser(request);
  if (currentUser.role !== "admin") {
    throw redirect("/");
  }

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

  const isLastAdmin =
    user.role === "admin"
      ? (await prisma.user.count({ where: { role: "admin" } })) === 1
      : false;

  return { user, currentUserId: currentUser.id, isLastAdmin };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUser = await requireUser(request);
  if (currentUser.role !== "admin") {
    throw redirect("/");
  }

  invariant(params.userId, "userId is required");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent !== "update_role") {
    return data({ error: "Invalid intent." }, { status: 400 });
  }

  const newRole = formData.get("newRole");
  if (!isValidRole(newRole)) {
    return data({ error: "Invalid role." }, { status: 400 });
  }

  const target = await prisma.user.findUniqueOrThrow({
    where: { id: params.userId },
    select: { id: true, role: true },
  });

  const adminCount = await prisma.user.count({ where: { role: "admin" } });

  const result = validateRoleChange({
    currentUserId: currentUser.id,
    targetUserId: target.id,
    targetCurrentRole: target.role,
    newRole,
    adminCount,
  });

  if (!result.valid) {
    return data({ error: result.error }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: params.userId },
    data: { role: newRole },
  });

  return data({ error: null });
};

export default function AdminUserDetailPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user, currentUserId, isLastAdmin } = loaderData;
  const navigation = useNavigation();
  const isSelf = user.id === currentUserId;
  const canChangeRole = !isSelf && !(user.role === "admin" && isLastAdmin);

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
            <span className={styles.value}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-end"
                xsGap={8}
              >
                <span>{user.role}</span>
                <Form method="post">
                  <input type="hidden" name="intent" value="update_role" />
                  <input
                    type="hidden"
                    name="newRole"
                    value={user.role === "admin" ? "customer" : "admin"}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={!canChangeRole || navigation.state !== "idle"}
                  >
                    {user.role === "admin"
                      ? "Revoke admin"
                      : "Promote to admin"}
                  </Button>
                </Form>
                {actionData?.error ? (
                  <Box color="red-9" role="alert">
                    {actionData.error}
                  </Box>
                ) : null}
              </Box>
            </span>
          </div>
          <Divider variant="light" />
          <div className={styles.row}>
            <span className={styles.label}>Member since</span>
            <span className={styles.value}>{formatDate(user.createdAt)}</span>
          </div>
          <Divider variant="light" />
          <div className={styles.row}>
            <span className={styles.label}>Two-factor authentication</span>
            <span className={styles.value}>
              {user.twoFactorEnabled ? "Enabled" : "Not enabled"}
            </span>
          </div>
          <Divider variant="light" />
          <div className={styles.row}>
            <span className={styles.label}>Email verified</span>
            <span className={styles.value}>
              {user.emailVerifiedAt ? formatDate(user.emailVerifiedAt) : "N/A"}
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
