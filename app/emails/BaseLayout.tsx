import type { ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

import { colors } from "~/components/_GlobalStyles/colors";

const fonts = {
  serif: "Georgia, 'Times New Roman', serif",
};

interface BaseLayoutProps {
  preview: string;
  children: ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.siteName}>The Ledger</Heading>
            <Hr style={styles.divider} />
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Hr style={styles.divider} />
            <Text style={styles.footerText}>
              The Ledger &mdash; theledger.dev
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: colors["sand-3"],
    fontFamily: fonts.serif,
    margin: "0",
    padding: "32px 16px",
  },
  container: {
    backgroundColor: colors["sand-1"],
    borderRadius: "4px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "40px",
  },
  header: {
    marginBottom: "24px",
  },
  siteName: {
    color: colors["sand-12"],
    fontFamily: fonts.serif,
    fontSize: "28px",
    fontWeight: "normal",
    letterSpacing: "-0.5px",
    margin: "0 0 20px",
  },
  divider: {
    borderColor: colors["sand-7"],
    borderTopWidth: "1px",
    margin: "0",
  },
  content: {
    padding: "24px 0",
  },
  footer: {
    marginTop: "8px",
  },
  footerText: {
    color: colors["sand-11"],
    fontSize: "12px",
    letterSpacing: "0.05em",
    margin: "12px 0 0",
    textTransform: "uppercase" as const,
  },
} as const;
