import { Secret, TOTP } from "otpauth";
import { Form, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { getSession, sessionStorage } from "~/session.server";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request);
  const userId = session.get("2fa:user-id");
  const formData = await request.formData();
  const token = formData.get("token");

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
  session.set("userId", user.id);

  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}

export default function TwoFactorAuth() {
  return (
    <Box>
      <Form method="post">
        <TextInput label="2FA Token" name="token" required type="number" />
        <Button type="submit">Submit</Button>
      </Form>
    </Box>
  );
}
