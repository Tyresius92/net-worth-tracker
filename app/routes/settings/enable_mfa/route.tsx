import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs} from "react-router";
import {
  data,
  Form,
  redirect,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { generateRecoveryCodes } from "~/models/recovery-code.server";
import { getSession, getUser, loginRedirect, sessionStorage } from "~/session.server";
import { HttpError } from "~/utils/httpError.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (!user) return loginRedirect(url);
  const session = await getSession(request);

  if (user.twoFactorEnabled) {
    return redirect("..");
  }

  const secret = new Secret({
    size: 20,
  });

  const totp = new TOTP({
    issuer:
      process.env.NODE_ENV === "production"
        ? "The Ledger"
        : "The Ledger Testing",
    label: user.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  session.set("2fa:temp-secret", secret.base32);

  const uri = totp.toString();
  const qrCode = await QRCode.toDataURL(uri);

  return data(
    {
      qrCode,
    },
    {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    },
  );
};

export const action = async ({ request, url }: ActionFunctionArgs) => {
  const user = await getUser(request);
  if (!user) return loginRedirect(url);
  const session = await getSession(request);

  const formData = await request.formData();

  const token = formData.get("token");
  const secretBase32 = session.get("2fa:temp-secret");

  if (!token || !secretBase32) {
    throw new HttpError("Invalid request", 400);
  }

  const totp = new TOTP({
    issuer:
      process.env.NODE_ENV === "production"
        ? "The Ledger"
        : "The Ledger Testing",
    label: user.email,
    secret: Secret.fromBase32(secretBase32),
  });

  const delta = totp.validate({ token: token.toString(), window: 1 });

  if (delta === null) {
    throw new HttpError("Invalid code", 400);
  }

  // Persist 2FA
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secretBase32,
    },
  });

  session.unset("2fa:temp-secret");

  const codes = await generateRecoveryCodes(user.id);
  session.set("recovery-codes:new-codes", codes);

  return redirect("/settings/recovery_codes", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

export default function Enable2FA({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <h1>Enable 2FA route</h1>

      <img src={loaderData.qrCode} alt="Scan with authenticator app" />
      <p>Scan with Google Authenticator or Authy</p>

      <Form method="post">
        <TextInput
          label="Token"
          type="number"
          name="token"
          pattern="[0-9]{6}"
          placeholder="123456"
          required
        />
        <Button type="submit">Verify</Button>
      </Form>
    </Box>
  );
}
