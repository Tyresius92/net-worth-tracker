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
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { EmailVerificationEmail } from "~/emails/EmailVerificationEmail";
import { createEmailVerificationToken } from "~/models/email-verification.server";
import { createUser, getUserByEmail } from "~/models/user.server";
import { getSession, getUserId, sessionStorage } from "~/session.server";
import { validateEmail } from "~/utils";
import { sendEmail } from "~/utils/email.server";
import { getClientIp, isRateLimited } from "~/utils/rate-limit.server";

import styles from "./join.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const ip = getClientIp(request);
  if (isRateLimited(`join:${ip}`)) {
    return data(
      {
        errors: {
          email: "Too many attempts. Try again in 15 minutes.",
          password: null,
          firstName: null,
          lastName: null,
        },
      },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const email = formData.get("email");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const password = formData.get("password");

  const baseErrors: Record<
    "email" | "password" | "firstName" | "lastName",
    string | null
  > = { email: null, password: null, firstName: null, lastName: null };

  if (!validateEmail(email)) {
    return data(
      { errors: { ...baseErrors, email: "Email is invalid" } },
      { status: 400 },
    );
  }

  if (typeof firstName !== "string" || !firstName) {
    return data(
      { errors: { ...baseErrors, firstName: "First name is required" } },
      { status: 400 },
    );
  }

  if (typeof lastName !== "string" || !lastName) {
    return data(
      { errors: { ...baseErrors, lastName: "Last name is required" } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return data(
      { errors: { ...baseErrors, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return data(
      { errors: { ...baseErrors, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return data(
      {
        errors: {
          ...baseErrors,
          email: "A user already exists with this email",
        },
      },
      { status: 400 },
    );
  }

  const user = await createUser({ email, password, firstName, lastName });

  const token = await createEmailVerificationToken(user.id);
  const verifyUrl = `${new URL(request.url).origin}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    react: (
      <EmailVerificationEmail
        firstName={user.firstName}
        verifyUrl={verifyUrl}
      />
    ),
  });

  const session = await getSession(request);
  session.set("pending-verification:userId", user.id);

  return redirect("/verify-email/pending", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
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
        <h2 className={styles.headline}>Apply for credentials</h2>
        <Divider variant="light" />
        <p className={styles.tagline}>Your finances. Your data. No charge.</p>
      </div>

      <Box borderColor="sand-12" xsP={24}>
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
            type="text"
            label="First name"
            name="firstName"
            required
            autoComplete="given-name"
            errorMessage={actionData?.errors?.firstName ?? undefined}
          />
          <TextInput
            type="text"
            label="Last name"
            name="lastName"
            required
            autoComplete="family-name"
            errorMessage={actionData?.errors?.lastName ?? undefined}
          />
          <TextInput
            ref={passwordRef}
            type="password"
            label="Password"
            name="password"
            autoComplete="new-password"
            errorMessage={actionData?.errors?.password ?? undefined}
          />
          <div className={styles.actions}>
            <Button type="submit">Apply</Button>
            <Link to={{ pathname: "/login", search: searchParams.toString() }}>
              Already a subscriber? Log in
            </Link>
          </div>
        </Form>
      </Box>
    </>
  );
}
