import { Button, Heading, Hr, Section, Text } from "react-email";

import { colors } from "~/components/_GlobalStyles/colors";

import { BaseLayout } from "./BaseLayout";

const fonts = {
  serif: "Georgia, 'Times New Roman', serif",
};

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  firstName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your The Ledger password — this link expires in one hour.">
      <Heading style={styles.heading}>Reset your password</Heading>

      <Text style={styles.body}>
        Hi {firstName}, a credentials reset was requested for your subscription.
        Click the button below to choose a new password. This link expires in
        one hour.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button href={resetUrl} style={styles.button}>
          Reset password
        </Button>
      </Section>

      <Text style={styles.fallbackLabel}>
        If the button doesn&apos;t work, copy this link into your browser:
      </Text>
      <Text style={styles.fallbackUrl}>{resetUrl}</Text>

      <Hr style={styles.divider} />

      <Text style={styles.disclaimer}>
        If you didn&apos;t request a password reset, you can safely ignore this
        email. Your password won&apos;t change.
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: {
    color: colors["sand-12"],
    fontFamily: fonts.serif,
    fontSize: "20px",
    fontWeight: "normal",
    margin: "0 0 16px",
  },
  body: {
    color: colors["sand-12"],
    fontFamily: fonts.serif,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  buttonContainer: {
    margin: "0 0 24px",
  },
  button: {
    backgroundColor: colors["sand-12"],
    borderRadius: "4px",
    color: colors["sand-1"],
    fontFamily: fonts.serif,
    fontSize: "14px",
    fontWeight: "normal",
    padding: "12px 24px",
    textDecoration: "none",
  },
  fallbackLabel: {
    color: colors["sand-11"],
    fontFamily: fonts.serif,
    fontSize: "12px",
    margin: "0 0 4px",
  },
  fallbackUrl: {
    color: colors["sand-11"],
    fontFamily: fonts.serif,
    fontSize: "12px",
    margin: "0 0 24px",
    wordBreak: "break-all" as const,
  },
  divider: {
    borderColor: colors["sand-7"],
    borderTopWidth: "1px",
    margin: "0 0 16px",
  },
  disclaimer: {
    color: colors["sand-11"],
    fontFamily: fonts.serif,
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0",
  },
} as const;
