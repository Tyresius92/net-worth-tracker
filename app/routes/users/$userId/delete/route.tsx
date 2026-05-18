import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  data,
  Form,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import invariant from "tiny-invariant";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Flex } from "~/components/Flex/Flex";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { deleteUserById } from "~/models/user.server";
import { requireUser } from "~/session.server";

import styles from "./admin-delete-user.module.css";

async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  if (user.role !== "admin") throw redirect("/", { status: 403 });
  return user;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const currentUser = await requireAdmin(request);
  invariant(params.userId, "userId is required");

  const target = await prisma.user.findUniqueOrThrow({
    where: { id: params.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  if (target.id === currentUser.id) {
    return data(
      {
        target,
        error:
          "You cannot delete your own account from here. Use your account settings.",
      },
      { status: 400 },
    );
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (target.role === "admin" && adminCount === 1) {
    return data(
      {
        target,
        error: "This is the only administrator account and cannot be deleted.",
      },
      { status: 400 },
    );
  }

  return { target, error: null };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUser = await requireAdmin(request);
  invariant(params.userId, "userId is required");

  const target = await prisma.user.findUniqueOrThrow({
    where: { id: params.userId },
    select: { id: true, role: true },
  });

  if (target.id === currentUser.id) {
    return data(
      {
        error:
          "You cannot delete your own account from here. Use your account settings.",
      },
      { status: 400 },
    );
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (target.role === "admin" && adminCount === 1) {
    return data(
      {
        error: "This is the only administrator account and cannot be deleted.",
      },
      { status: 400 },
    );
  }

  await deleteUserById(target.id);

  return redirect("/users");
};

export default function AdminDeleteUserPage() {
  const { target, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const displayError = actionData?.error ?? error;

  return (
    <Box p={24} maxWidth={480}>
      <h1 className={styles.heading}>Delete Account</h1>

      <p className={styles.target}>
        {target.firstName} {target.lastName} &middot;{" "}
        <span className={styles.email}>{target.email}</span>
      </p>

      <p className={styles.warning}>
        This action is permanent and cannot be undone.
      </p>

      <ul className={styles.consequenceList}>
        <li>The account will be immediately deleted.</li>
        <li>All of their accounts and balance history will be deleted.</li>
        <li>
          All connected bank accounts via Plaid will be disconnected and
          deleted.
        </li>
      </ul>

      {displayError ? (
        <p className={styles.formError}>{displayError}</p>
      ) : (
        <Form method="post">
          <Flex flexDirection="column" gap={12} mt={24}>
            <Button type="submit" variant="danger">
              Permanently delete this account
            </Button>
            <Link to={`/users/${target.id}`}>Cancel</Link>
          </Flex>
        </Form>
      )}

      {displayError ? (
        <Box mt={16}>
          <Link to={`/users/${target.id}`}>← Back</Link>
        </Box>
      ) : null}
    </Box>
  );
}
