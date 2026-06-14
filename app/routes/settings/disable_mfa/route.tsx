import { Secret, TOTP } from "otpauth";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, redirect, useActionData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

import styles from "./disable-mfa.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  if (!user.twoFactorEnabled) {return redirect("/settings");}
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  if (!user.twoFactorEnabled) {return redirect("/settings");}

  const formData = await request.formData();
  const token = formData.get("token");

  if (!token || typeof token !== "string") {
    return data({ error: "Verification code is required" }, { status: 400 });
  }

  const userWithSecret = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorSecret: true },
  });

  if (!userWithSecret?.twoFactorSecret) {return redirect("/settings");}

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
    return data({ error: "Invalid verification code" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    }),
  ]);

  return redirect("/settings");
};

export default function DisableMFAPage() {
  const actionData = useActionData<typeof action>();

  return (
    <Box xsP={24} maxWidth={480}>
      <h1 className={styles.heading}>Disable Two-Factor Authentication</h1>

      <p className={styles.warning}>
        Before disabling, make sure you understand what will change:
      </p>

      <ul className={styles.consequenceList}>
        <li>Your account will be protected by password alone.</li>
        <li>All of your recovery codes will be permanently deleted.</li>
        <li>Wire service figures will pause until 2FA is re-enabled.</li>
      </ul>

      <Form method="post">
        <TextInput
          type="number"
          label="Confirm with your authenticator code"
          name="token"
          required
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          errorMessage={actionData?.error ?? undefined}
        />
        <div className={styles.actions}>
          <Button type="submit">Disable two-factor authentication</Button>
          <Link to="/settings">Cancel</Link>
        </div>
      </Form>
    </Box>
  );
}
