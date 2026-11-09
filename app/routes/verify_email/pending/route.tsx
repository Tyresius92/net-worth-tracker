import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  data,
  Form,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { Text } from "~/components/Text/Text";
import { EmailVerificationEmail } from "~/emails/EmailVerificationEmail";
import { logger } from "~/logger";
import { createEmailVerificationToken } from "~/models/email-verification.server";
import { getUserById } from "~/models/user.server";
import { getSession, getUserId, sessionStorage } from "~/session.server";
import { sendEmail } from "~/utils/email.server";
import { verificationEmailCap } from "~/utils/rate-limit.server";

import styles from "./pending.module.css";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  const session = await getSession(request);
  const pendingUserId: unknown = session.get("pending-verification:userId");
  if (!pendingUserId) {
    return redirect("/join");
  }

  const expired = url.searchParams.get("expired") === "1";

  return data({ expired });
};

export const action = async ({ request, url }: ActionFunctionArgs) => {
  const session = await getSession(request);
  const pendingUserId: unknown = session.get("pending-verification:userId");
  if (!pendingUserId || typeof pendingUserId !== "string") {
    return redirect("/join");
  }

  const user = await getUserById(pendingUserId);
  if (!user) {
    return redirect("/join");
  }

  if (!verificationEmailCap.tryConsume()) {
    logger.warn("Verification email cap reached; skipping resend", {
      userId: user.id,
    });
    return data({ resent: false, capped: true }, { status: 429 });
  }

  const token = await createEmailVerificationToken(user.id);
  const verifyUrl = `${url.origin}/verify_email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    react: <EmailVerificationEmail verifyUrl={verifyUrl} />,
  });

  return data(
    { resent: true, capped: false },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } },
  );
};

export default function VerifyEmailPendingPage() {
  const { expired } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Box xsMb={24}>
        <Divider variant="light" />
        <h2 className={styles.headline}>Check Your Inbox</h2>
        <Divider variant="light" />
      </Box>

      <Box border={{ color: "sand-12" }} xsP={24}>
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

          {actionData?.capped ? (
            <Box color="red-9" role="alert">
              <Text>
                We couldn&apos;t send another email right now. Try again
                tomorrow.
              </Text>
            </Box>
          ) : null}

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
