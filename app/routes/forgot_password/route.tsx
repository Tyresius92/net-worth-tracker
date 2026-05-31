import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, Form, redirect, useActionData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { PasswordResetEmail } from "~/emails/PasswordResetEmail";
import { createPasswordResetToken } from "~/models/password-reset.server";
import { getUserByEmail } from "~/models/user.server";
import { getUserId } from "~/session.server";
import { validateEmail } from "~/utils";
import { sendEmail } from "~/utils/email.server";
import { getClientIp, isRateLimited } from "~/utils/rate-limit.server";

import styles from "./forgot_password.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const ip = getClientIp(request);
  if (isRateLimited(`forgot-password:${ip}`)) {
    return data({ submitted: true, errors: { email: null } });
  }

  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return data(
      { submitted: false, errors: { email: "Email is invalid" } },
      { status: 400 },
    );
  }

  const user = await getUserByEmail(email);

  if (user) {
    const token = await createPasswordResetToken(user.id);
    const { origin } = new URL(request.url);
    const resetUrl = `${origin}/reset_password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      react: (
        <PasswordResetEmail firstName={user.firstName} resetUrl={resetUrl} />
      ),
    });
  }

  return data({ submitted: true, errors: { email: null } });
};

export const meta: MetaFunction = () => [{ title: "Forgot Password" }];

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>();

  if (actionData?.submitted) {
    return (
      <>
        <div className={styles.headlineArea}>
          <Divider variant="light" />
          <h2 className={styles.headline}>Check Your Inbox</h2>
          <Divider variant="light" />
        </div>

        <Box borderColor="sand-12" xsP={24}>
          <p className={styles.confirmation}>
            If that email address is registered, you&apos;ll receive a password
            reset link shortly. The link expires in one hour.
          </p>
        </Box>

        <div className={styles.actions}>
          <Link to="/login">Back to login</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.headlineArea}>
        <Divider variant="light" />
        <h2 className={styles.headline}>Reset Your Password</h2>
        <Divider variant="light" />
        <p className={styles.descriptor}>
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <Box borderColor="sand-12" xsP={24}>
        <Form method="post">
          <TextInput
            type="email"
            label="Email address"
            name="email"
            required
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            autoComplete="email"
            errorMessage={actionData?.errors?.email ?? undefined}
          />
          <div className={styles.actions}>
            <Button type="submit">Send reset link</Button>
            <Link to="/login">Back to login</Link>
          </div>
        </Form>
      </Box>
    </>
  );
}
