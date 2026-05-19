import bcrypt from "bcryptjs";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, redirect, useActionData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  const baseErrors = {
    currentPassword: null,
    newPassword: null,
    confirmPassword: null,
  };

  if (typeof currentPassword !== "string" || !currentPassword) {
    return data(
      {
        errors: {
          ...baseErrors,
          currentPassword: "Current password is required",
        },
      },
      { status: 400 },
    );
  }

  if (typeof newPassword !== "string" || newPassword.length === 0) {
    return data(
      { errors: { ...baseErrors, newPassword: "New password is required" } },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return data(
      {
        errors: {
          ...baseErrors,
          newPassword: "Password must be at least 8 characters",
        },
      },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return data(
      { errors: { ...baseErrors, confirmPassword: "Passwords do not match" } },
      { status: 400 },
    );
  }

  const record = await prisma.password.findUnique({
    where: { userId: user.id },
  });
  if (!record) return redirect("/settings");

  const isValid = await bcrypt.compare(currentPassword, record.hash);
  if (!isValid) {
    return data(
      { errors: { ...baseErrors, currentPassword: "Incorrect password" } },
      { status: 400 },
    );
  }

  await prisma.password.update({
    where: { userId: user.id },
    data: { hash: await bcrypt.hash(newPassword, 10) },
  });

  return redirect("/settings");
};

export default function ChangePasswordPage() {
  const actionData = useActionData<typeof action>();

  return (
    <Box p={24} maxWidth={480}>
      <Box mb={24}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Change Password
        </h1>
      </Box>

      <Form method="post">
        <TextInput
          type="password"
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          errorMessage={actionData?.errors?.currentPassword ?? undefined}
        />
        <TextInput
          type="password"
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          errorMessage={actionData?.errors?.newPassword ?? undefined}
        />
        <TextInput
          type="password"
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          errorMessage={actionData?.errors?.confirmPassword ?? undefined}
        />
        <Box display="flex" flexDirection="column" gap={12} mt={24}>
          <Button type="submit">Change password</Button>
          <Link to="/settings">Cancel</Link>
        </Box>
      </Form>
    </Box>
  );
}
