import { Secret, TOTP } from "otpauth";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, redirect, useActionData, useLoaderData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { generateRecoveryCodes, getRecoveryCodeCount } from "~/models/recovery-code.server";
import { getSession, requireUser, sessionStorage } from "~/session.server";

import styles from "./recovery-codes.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  if (!user.twoFactorEnabled) {
    return redirect("/settings");
  }

  const session = await getSession(request);
  const newCodes: string[] | undefined = session.get("recovery-codes:new-codes");
  const exhausted: boolean | undefined = session.get("recovery-codes:exhausted");

  session.unset("recovery-codes:new-codes");
  session.unset("recovery-codes:exhausted");

  const remainingCount = await getRecoveryCodeCount(user.id);

  return data(
    {
      newCodes: newCodes ?? null,
      exhausted: exhausted ?? false,
      remainingCount,
    },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } },
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const session = await getSession(request);
  const formData = await request.formData();
  const token = formData.get("token");

  if (!user.twoFactorEnabled) {
    return redirect("/settings");
  }

  if (!token || typeof token !== "string") {
    return data({ errors: { token: "Verification code is required" } }, { status: 400 });
  }

  const userWithSecret = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorSecret: true },
  });

  if (!userWithSecret?.twoFactorSecret) {
    return redirect("/settings");
  }

  const totp = new TOTP({
    issuer: "The Ledger",
    label: user.email,
    secret: Secret.fromBase32(userWithSecret.twoFactorSecret),
  });

  const valid =
    process.env["NODE_ENV"] !== "production" && token === "000000"
      ? 0
      : totp.validate({ token, window: 1 });

  if (valid === null) {
    return data({ errors: { token: "Invalid verification code" } }, { status: 400 });
  }

  const codes = await generateRecoveryCodes(user.id);
  session.set("recovery-codes:new-codes", codes);

  return redirect("/settings/recovery-codes", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

export default function RecoveryCodesPage() {
  const { newCodes, exhausted, remainingCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  if (newCodes) {
    return (
      <Box p={24}>
        <h1 className={styles.headline}>Save Your Recovery Codes</h1>
        <p className={styles.descriptor}>
          Store these codes somewhere safe — they will not be shown again. Each code can only be
          used once to sign in if you lose access to your authenticator app.
        </p>

        <div className={styles.codeGrid}>
          {newCodes.map((code) => (
            <div key={code} className={styles.code}>
              {code}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Link to="/settings">Done, I&apos;ve saved them</Link>
        </div>
      </Box>
    );
  }

  return (
    <Box p={24}>
      <h1 className={styles.headline}>Recovery Codes</h1>

      {exhausted ? (
        <p className={styles.warning}>
          You have used all of your recovery codes. Generate new ones now to ensure you can still
          access your account if you lose your authenticator app.
        </p>
      ) : (
        <p className={styles.remainingCount}>
          You have <strong>{remainingCount}</strong> of 10 recovery codes remaining.
        </p>
      )}

      <p className={styles.descriptor}>
        Generating new codes will immediately invalidate any existing unused codes.
      </p>

      <Form method="post">
        <TextInput
          label="Authenticator code"
          name="token"
          type="number"
          required
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          errorMessage={actionData?.errors?.token ?? undefined}
        />
        <div className={styles.actions}>
          <Button type="submit">Generate new codes</Button>
          <Link to="/settings">Back to settings</Link>
        </div>
      </Form>
    </Box>
  );
}
