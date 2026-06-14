import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, redirect, useLoaderData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { EmailVerificationEmail } from "~/emails/EmailVerificationEmail";
import { createEmailVerificationToken } from "~/models/email-verification.server";
import { getUserById } from "~/models/user.server";
import { getSession, getUserId, sessionStorage } from "~/session.server";
import { sendEmail } from "~/utils/email.server";

import styles from "./pending.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) {return redirect("/");}

  const session = await getSession(request);
  const pendingUserId: string | undefined = session.get(
    "pending-verification:userId",
  );
  if (!pendingUserId) {return redirect("/join");}

  const expired = new URL(request.url).searchParams.get("expired") === "1";

  return data({ expired });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request);
  const pendingUserId: string | undefined = session.get(
    "pending-verification:userId",
  );
  if (!pendingUserId) {return redirect("/join");}

  const user = await getUserById(pendingUserId);
  if (!user) {return redirect("/join");}

  const token = await createEmailVerificationToken(user.id);
  const verifyUrl = `${new URL(request.url).origin}/verify_email?token=${token}`;

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

  return data(
    { resent: true },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } },
  );
};

export default function VerifyEmailPendingPage() {
  const { expired } = useLoaderData<typeof loader>();

  return (
    <>
      <Box xsMb={24}>
        <Divider variant="light" />
        <h2 className={styles.headline}>Check Your Inbox</h2>
        <Divider variant="light" />
      </Box>

      <Box borderColor="sand-12" xsP={24}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          xsGap={24}
        >
          <p className={styles.descriptor}>
            {expired
              ? "That verification link has expired. Request a new one below."
              : "We sent a verification link to your email address. Click it to activate your account. The link expires in 24 hours."}
          </p>

          <Form method="post">
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              xsGap={12}
            >
              <Button type="submit">Resend verification email</Button>
              <Link to="/login">Back to login</Link>
            </Box>
          </Form>
        </Box>
      </Box>
    </>
  );
}
