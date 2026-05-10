import { useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, Form, redirect, useActionData, useLoaderData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import {
  consumePasswordResetToken,
  verifyPasswordResetToken,
} from "~/models/password-reset.server";
import { getUserId } from "~/session.server";

import styles from "./reset-password.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const token = new URL(request.url).searchParams.get("token");
  if (!token) return redirect("/forgot-password");

  const record = await verifyPasswordResetToken(token);
  if (!record) return data({ valid: false, token: null });

  return data({ valid: true, token });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  const baseErrors = { token: null, password: null, confirmPassword: null };

  if (typeof token !== "string" || !token) {
    return redirect("/forgot-password");
  }

  if (typeof password !== "string" || password.length === 0) {
    return data(
      { errors: { ...baseErrors, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return data(
      { errors: { ...baseErrors, password: "Password must be at least 8 characters" } },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return data(
      { errors: { ...baseErrors, confirmPassword: "Passwords do not match" } },
      { status: 400 },
    );
  }

  const record = await verifyPasswordResetToken(token);
  if (!record) {
    return data(
      { errors: { ...baseErrors, token: "This reset link has expired or already been used." } },
      { status: 400 },
    );
  }

  await consumePasswordResetToken(record.id, record.user.id, password);

  return redirect("/login");
};

export const meta: MetaFunction = () => [{ title: "Reset Password" }];

export default function ResetPasswordPage() {
  const { valid, token } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  if (!valid) {
    return (
      <>
        <div className={styles.headlineArea}>
          <Divider variant="light" />
          <h2 className={styles.headline}>Link Expired</h2>
          <Divider variant="light" />
          <p className={styles.descriptor}>
            This password reset link has expired or already been used.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.headlineArea}>
        <Divider variant="light" />
        <h2 className={styles.headline}>Choose a New Password</h2>
        <Divider variant="light" />
      </div>

      <Box borderColor="sand-12" p={24}>
        <Form method="post">
          <input type="hidden" name="token" value={token ?? ""} />

          {actionData?.errors?.token ? (
            <p className={styles.descriptor}>{actionData.errors.token}</p>
          ) : null}

          <TextInput
            ref={passwordRef}
            type="password"
            label="New password"
            name="password"
            autoComplete="new-password"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            errorMessage={actionData?.errors?.password ?? undefined}
          />
          <TextInput
            ref={confirmPasswordRef}
            type="password"
            label="Confirm new password"
            name="confirmPassword"
            autoComplete="new-password"
            errorMessage={actionData?.errors?.confirmPassword ?? undefined}
          />

          <div className={styles.actions}>
            <Button type="submit">Set new password</Button>
          </div>
        </Form>
      </Box>
    </>
  );
}
