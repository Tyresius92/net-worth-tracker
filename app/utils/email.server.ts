import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@theledger.dev";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const html = await render(react);

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[email] To: ${to} | Subject: ${subject}\n${html}\n`);
    return;
  }

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }
}
