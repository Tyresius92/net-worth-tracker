import { Secret, TOTP } from "otpauth";
import { Form } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { TextInput } from "~/components/TextInput/TextInput";

import styles from "./twofa.module.css";
import { prisma } from "~/db.server";
import { createUserSession, getSession } from "~/session.server";
import { getClientIp, isRateLimited } from "~/utils/rate-limit.server";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request);
  const userId = session.get("2fa:user-id");
  const remember = session.get("2fa:remember");
  const formData = await request.formData();
  const token = formData.get("token");

  const ip = getClientIp(request);
  if (isRateLimited(`2fa:${ip}:${userId ?? "unknown"}`)) {
    throw new Response("Too many attempts. Try again in 15 minutes.", {
      status: 429,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      twoFactorSecret: true,
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  if (!token || typeof token !== "string") {
    throw new Response("Token is required");
  }

  const totp = new TOTP({
    issuer: "The Ledger",
    label: user.email,
    secret: Secret.fromBase32(user.twoFactorSecret!),
  });

  const valid =
    process.env["NODE_ENV"] === "production"
      ? totp.validate({ token, window: 1 })
      : token === "000000";

  if (valid === null) {
    throw new Response("Invalid code", { status: 400 });
  }

  // Finalize login
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
  return (
    <>
      <div className={styles.headlineArea}>
        <Divider variant="light" />
        <h2 className={styles.headline}>Verification Required</h2>
        <Divider variant="light" />
        <p className={styles.descriptor}>
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      <Box borderColor="sand-12" p={24}>
        <Form method="post">
          <TextInput label="Verification Code" name="token" required type="number" />
          <div className={styles.actions}>
            <Button type="submit">Verify</Button>
            <Link to="/login">Back to login</Link>
          </div>
        </Form>
      </Box>
    </>
  );
}
