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
import { Link } from "~/components/Link/Link";
import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  const baseErrors: Record<
    "email" | "password" | "firstName" | "lastName",
    string | null
  > = {
    email: null,
    password: null,
    firstName: null,
    lastName: null,
  };

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

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
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
    <Box>
      <Box>
        <Form method="post">
          <Box>
            <label htmlFor="email">Email address</label>
            <Box>
              <input
                ref={emailRef}
                id="email"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
              />
              {actionData?.errors?.email ? (
                <Box id="email-error">{actionData.errors.email}</Box>
              ) : null}
            </Box>
          </Box>

          <Box>
            <label htmlFor="password">Password</label>
            <Box>
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />
              {actionData?.errors?.password ? (
                <Box id="password-error">{actionData.errors.password}</Box>
              ) : null}
            </Box>
          </Box>

          <Box>
            <label htmlFor="firstName">First name</label>
            <Box>
              <input
                ref={emailRef}
                id="firstName"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                name="firstName"
                type="text"
                autoComplete="given-name"
                aria-invalid={actionData?.errors?.firstName ? true : undefined}
                aria-describedby="firstname-error"
              />
              {actionData?.errors?.firstName ? (
                <Box id="firstname-error">{actionData.errors.firstName}</Box>
              ) : null}
            </Box>
          </Box>

          <Box>
            <label htmlFor="lastName">Last name</label>
            <Box>
              <input
                ref={emailRef}
                id="lastName"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                name="lastName"
                type="text"
                autoComplete="family-name"
                aria-invalid={actionData?.errors?.lastName ? true : undefined}
                aria-describedby="lastname-error"
              />
              {actionData?.errors?.lastName ? (
                <Box id="lastname-error">{actionData.errors.lastName}</Box>
              ) : null}
            </Box>
          </Box>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit">Create Account</Button>
          <Box>
            <Box>
              Already have an account?{" "}
              <Link
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </Box>
          </Box>
        </Form>
      </Box>
    </Box>
  );
}
