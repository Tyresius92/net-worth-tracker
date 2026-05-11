import { useEffect, useRef } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  data,
  redirect,
  Form,
  useActionData,
  useSearchParams,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Checkbox } from "~/components/Checkbox/Checkbox";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { EmailVerificationEmail } from "~/emails/EmailVerificationEmail";
import { logger } from "~/logger";
import { createEmailVerificationToken } from "~/models/email-verification.server";
import { verifyLogin } from "~/models/user.server";
import {
  createUserSession,
  getSession,
  getUserId,
  sessionStorage,
} from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import { sendEmail } from "~/utils/email.server";
import { getClientIp, isRateLimited } from "~/utils/rate-limit.server";

import styles from "./login.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request);
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  const ip = getClientIp(request);
  const emailKey = typeof email === "string" ? email.toLowerCase() : "invalid";
  if (isRateLimited(`${ip}:${emailKey}`)) {
    logger.warn("Login rate limit hit", { ip, email: emailKey });
    return data(
      { errors: { email: "Too many login attempts. Try again in 15 minutes.", password: null } },
      { status: 429 },
    );
  }

  if (!validateEmail(email)) {
    return data(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return data(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return data(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return data(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 },
    );
  }

  if (!user.emailVerifiedAt) {
    const token = await createEmailVerificationToken(user.id);
    const verifyUrl = `${new URL(request.url).origin}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      react: <EmailVerificationEmail firstName={user.firstName} verifyUrl={verifyUrl} />,
    });
    session.set("pending-verification:userId", user.id);
    return redirect("/verify-email/pending", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }

  if (user.twoFactorEnabled) {
    session.set("2fa:user-id", user.id);
    session.set("2fa:remember", remember === "on" ? true : false);
    return redirect("/login/2fa", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <div className={styles.headlineArea}>
        <Divider variant="light" />
        <h2 className={styles.headline}>Subscriber Access</h2>
        <Divider variant="light" />
        <p className={styles.tagline}>Track your net worth, issue by issue.</p>
      </div>

      <Box borderColor="sand-12" p={24}>
        <Form method="post">
          <TextInput
            ref={emailRef}
            type="email"
            label="Email address"
            name="email"
            required
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            autoComplete="email"
            errorMessage={actionData?.errors?.email ?? undefined}
          />
          <TextInput
            ref={passwordRef}
            type="password"
            label="Password"
            name="password"
            autoComplete="current-password"
            errorMessage={actionData?.errors?.password ?? undefined}
          />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className={styles.actions}>
            <Checkbox name="remember" label="Remember me" />
            <Button type="submit">Log in</Button>
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/join">Don&apos;t have an account? Sign up</Link>
          </div>
        </Form>
      </Box>
    </>
  );
}
