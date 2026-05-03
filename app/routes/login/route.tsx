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
import { TextInput } from "~/components/TextInput/TextInput";
import { logger } from "~/logger";
import { verifyLogin } from "~/models/user.server";
import {
  createUserSession,
  getSession,
  getUserId,
  sessionStorage,
} from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import { getClientIp, isRateLimited } from "~/utils/rate-limit.server";

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

  if (user.twoFactorEnabled) {
    session.set("2fa:user-id", user.id);
    session.set("2fa:remember", remember === "on" ? true : false);
    return redirect("./2fa", {
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
    <Box>
      <Box>
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
          <Button type="submit">Log in</Button>
          <Box>
            <input id="remember" name="remember" type="checkbox" />
            <label htmlFor="remember">Remember me</label>
          </Box>
        </Form>
      </Box>
    </Box>
  );
}
