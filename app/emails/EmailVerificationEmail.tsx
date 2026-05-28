import { Button, Heading, Hr, Section, Text } from "react-email";

import { colors } from "~/components/_GlobalStyles/colors";

import { BaseLayout } from "./BaseLayout";

const fonts = {
  serif: "Georgia, 'Times New Roman', serif",
};

interface EmailVerificationEmailProps {
  firstName: string;
  verifyUrl: string;
}

export function EmailVerificationEmail({
  firstName,
  verifyUrl,
}: EmailVerificationEmailProps) {
  return (
    <BaseLayout preview="Verify your email address for The Ledger.">
      <Heading style={styles.heading}>Verify your email address</Heading>

      <Text style={styles.body}>
        Hi {firstName}, thanks for signing up. Click the button below to verify
        your email address and access your record. This link expires in 24
        hours.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button href={verifyUrl} style={styles.button}>
          Verify email address
        </Button>
      </Section>

      <Text style={styles.fallbackLabel}>
        If the button doesn&apos;t work, copy this link into your browser:
      </Text>
      <Text style={styles.fallbackUrl}>{verifyUrl}</Text>

      <Hr style={styles.divider} />

      <Text style={styles.disclaimer}>
        If you didn&apos;t apply for credentials, you can safely ignore this
        email.
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
