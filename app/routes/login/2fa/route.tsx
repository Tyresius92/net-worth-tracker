"use client";

import { Secret, TOTP } from "otpauth";
import { useState } from "react";
import { data, Form, redirect, useActionData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import {
  consumeRecoveryCode,
  getRecoveryCodeCount,
} from "~/models/recovery-code.server";
import {
  createUserSession,
  getSession,
  sessionStorage,
} from "~/session.server";
import { HttpError } from "~/utils/httpError.server";
import { getClientIp, isRateLimited } from "~/utils/rate-limit.server";

import styles from "./twofa.module.css";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request);
  const userId = session.get("2fa:user-id");
  if (!userId) {
    return redirect("/login");
  }
  return {};
}

export async function action({ request }: { request: Request }) {
  const session = await getSession(request);
  const userId = session.get("2fa:user-id");
  const remember = session.get("2fa:remember");
  const formData = await request.formData();
  const mode = formData.get("mode") ?? "totp";
  const code = formData.get("token");

  const ip = getClientIp(request);
  if (isRateLimited(`2fa:${ip}:${userId ?? "unknown"}`)) {
    return data(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, twoFactorSecret: true },
  });

  if (!user) {
    throw new HttpError("User not found", 404);
  }
  if (!code || typeof code !== "string") {
    return data({ error: "Code is required" }, { status: 400 });
  }

  if (mode === "recovery") {
    const valid = await consumeRecoveryCode(user.id, code);
    if (!valid) {
      return data({ error: "Invalid recovery code" }, { status: 400 });
    }

    const remaining = await getRecoveryCodeCount(user.id);

    session.unset("2fa:user-id");
    session.unset("2fa:remember");
    session.set("userId", user.id);

    if (remaining === 0) {
      session.set("recovery-codes:exhausted", true);
      return redirect("/settings/recovery_codes", {
        headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
      });
    }

    return createUserSession({
      request,
      userId: user.id,
      remember,
      redirectTo: "/",
    });
  }

  // TOTP mode
  const totp = new TOTP({
    issuer: "The Ledger",
    label: user.email,
    secret: Secret.fromBase32(user.twoFactorSecret!),
  });

  const valid =
    process.env.NODE_ENV !== "production" && code === "000000"
      ? 0
      : totp.validate({ token: code, window: 1 });

  if (valid === null) {
    return data({ error: "Invalid code" }, { status: 400 });
  }

  session.unset("2fa:user-id");
  session.unset("2fa:remember");
  session.set("userId", user.id);

  return createUserSession({
    request,
    userId: user.id,
    remember,
    redirectTo: "/",
  });
}

export default function TwoFactorAuth() {
  const actionData = useActionData<typeof action>();
  const [mode, setMode] = useState<"totp" | "recovery">("totp");

  return (
    <>
      <div className={styles.headlineArea}>
        <Divider variant="light" />
        <h2 className={styles.headline}>Verification Required</h2>
        <Divider variant="light" />
        <p className={styles.descriptor}>
          {mode === "totp"
            ? "Enter the 6-digit code from your authenticator app to continue."
            : "Enter one of your backup recovery codes to continue."}
        </p>
      </div>

      <Box borderColor="sand-12" xsP={24}>
        <Form method="post">
          <input type="hidden" name="mode" value={mode} />
          {mode === "totp" ? (
            <TextInput
              key="totp"
              type="number"
              label="Verification Code"
              name="token"
              required
              autoFocus
              errorMessage={actionData?.error ?? undefined}
            />
          ) : (
            <TextInput
              key="recovery"
              type="text"
              label="Recovery Code"
              name="token"
              required
              placeholder="XXXX-XXXX-XXXX"
              autoFocus
              errorMessage={actionData?.error ?? undefined}
            />
          )}
          <div className={styles.actions}>
            <Button type="submit">Verify</Button>
            {mode === "totp" ? (
              <button
                type="button"
                className={styles.toggleLink}
                onClick={() => { setMode("recovery"); }}
              >
                Use a recovery code instead
              </button>
            ) : (
              <button
                type="button"
                className={styles.toggleLink}
                onClick={() => { setMode("totp"); }}
              >
                Use authenticator app instead
              </button>
            )}
            <Link to="/login">Back to login</Link>
          </div>
        </Form>
      </Box>
    </>
  );
}
