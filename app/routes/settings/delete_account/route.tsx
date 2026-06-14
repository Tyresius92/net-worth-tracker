import bcrypt from "bcryptjs";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, redirect, useActionData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { deleteUserById } from "~/models/user.server";
import { logout, requireUser } from "~/session.server";

import styles from "./delete_account.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const confirmation = formData.get("confirmation");
  const password = formData.get("password");

  const baseErrors = { confirmation: null, password: null, form: null };

  if (typeof confirmation !== "string" || confirmation !== "DELETE") {
    return data(
      {
        errors: {
          ...baseErrors,
          confirmation: "Please type DELETE to confirm",
        },
      },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || !password) {
    return data(
      { errors: { ...baseErrors, password: "Password is required" } },
      { status: 400 },
    );
  }

  const record = await prisma.password.findUnique({
    where: { userId: user.id },
  });
  if (!record) {return redirect("/settings");}

  const isValid = await bcrypt.compare(password, record.hash);
  if (!isValid) {
    return data(
      { errors: { ...baseErrors, password: "Incorrect password" } },
      { status: 400 },
    );
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (user.role === "admin" && adminCount === 1) {
    return data(
      {
        errors: {
          ...baseErrors,
          form: "You are the only administrator. Transfer admin rights to another user before closing your record.",
        },
      },
      { status: 400 },
    );
  }

  await deleteUserById(user.id);

  return logout(request, { redirectTo: "/goodbye" });
};

export default function DeleteAccountPage() {
  const actionData = useActionData<typeof action>();

  return (
    <Box xsP={24} maxWidth={480}>
      <h1 className={styles.heading}>Close your record</h1>

      <p className={styles.warning}>
        This action is permanent and cannot be undone.
      </p>

      <ul className={styles.consequenceList}>
        <li>Your record will be immediately closed.</li>
        <li>All of your sources and figure history will be deleted.</li>
        <li>All connected wire services will be disconnected and deleted.</li>
        <li>There is no recovery mechanism.</li>
      </ul>

      {actionData?.errors?.form ? (
        <p className={styles.formError}>{actionData.errors.form}</p>
      ) : null}

      <Form method="post">
        <TextInput
          type="text"
          label="Type DELETE to confirm"
          name="confirmation"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          errorMessage={actionData?.errors?.confirmation ?? undefined}
        />
        <TextInput
          type="password"
          label="Current password"
          name="password"
          autoComplete="current-password"
          errorMessage={actionData?.errors?.password ?? undefined}
        />
        <Box display="flex" flexDirection="column" xsGap={12} xsMt={24}>
          <Button type="submit" variant="danger">
            Close my record permanently
          </Button>
          <Link to="/settings">Cancel</Link>
        </Box>
      </Form>
    </Box>
  );
}
