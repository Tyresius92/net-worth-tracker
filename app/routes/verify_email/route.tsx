import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

import {
  consumeEmailVerificationToken,
  verifyEmailVerificationToken,
} from "~/models/email-verification.server";
import { createUserSession, getUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return redirect("/join");
  }

  const record = await verifyEmailVerificationToken(token);
  if (!record) {
    return redirect("/verify_email/pending?expired=1");
  }

  await consumeEmailVerificationToken(record.id, record.user.id);

  return createUserSession({
    request,
    userId: record.user.id,
    remember: false,
    redirectTo: "/",
  });
};
