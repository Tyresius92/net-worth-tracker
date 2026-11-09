import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import { EmailVerificationEmail } from "./EmailVerificationEmail";

const VERIFY_URL = "https://theledger.dev/verify_email?token=abc123";

describe("EmailVerificationEmail", () => {
  it("includes the verify URL", async () => {
    const view = await render(
      <EmailVerificationEmail verifyUrl={VERIFY_URL} />,
    );
    expect(view).toContain(VERIFY_URL);
  });

  it("uses a fixed greeting with no user-supplied text", async () => {
    const view = await render(
      <EmailVerificationEmail verifyUrl={VERIFY_URL} />,
      { plainText: true },
    );
    expect(view).toContain("Thanks for applying for credentials.");
    expect(view).not.toMatch(/\bHi\b/);
  });
});
