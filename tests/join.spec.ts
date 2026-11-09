import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { deleteUser, findUserByEmail } from "./helpers";

// The join action is rate limited to 5 submissions per IP per 15 minutes,
// so keep the total number of submissions in this file at 5 or fewer.

const DEFAULT_EMAIL = "join-spec@example.com";
const HONEYPOT_EMAIL = "join-spec-honeypot@example.com";

const fillJoinForm = async (
  page: Page,
  {
    email = DEFAULT_EMAIL,
    firstName,
    lastName,
    honeypot,
  }: {
    email?: string;
    firstName: string;
    lastName: string;
    honeypot?: string;
  },
) => {
  await page.goto("/join");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByLabel("Password").fill("correct-horse-battery");
  if (honeypot !== undefined) {
    // The field is off-screen, so set it directly the way a bot would.
    await page
      .getByLabel("Leave this field empty")
      .evaluate((input: HTMLInputElement, value) => {
        input.value = value;
      }, honeypot);
  }
  const actionResponse = page.waitForResponse(
    (response) => response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Apply" }).click();
  await actionResponse;
};

test.beforeAll(async () => {
  await deleteUser(HONEYPOT_EMAIL);
});

test.afterAll(async () => {
  await deleteUser(HONEYPOT_EMAIL);
});

test.describe("join", () => {
  test.describe.configure({ mode: "serial" });

  test("rejects a name containing a link", async ({ page }) => {
    await fillJoinForm(page, {
      firstName: "Free bonus at https://example.com",
      lastName: "Spammer",
    });
    await expect(
      page.getByText("First name can't contain links"),
    ).toBeVisible();
    await expect(page.getByLabel("First name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("rejects a name that is too long", async ({ page }) => {
    await fillJoinForm(page, {
      firstName: "Ada",
      lastName: "a".repeat(51),
    });
    await expect(page.getByText("Last name is too long")).toBeVisible();
    await expect(page.getByLabel("Last name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("silently drops a submission that fills the honeypot", async ({
    page,
  }) => {
    await fillJoinForm(page, {
      email: HONEYPOT_EMAIL,
      firstName: "Ada",
      lastName: "Lovelace",
      honeypot: "https://spam.example",
    });
    await expect(page).toHaveURL(/\/join$/);
    expect(await findUserByEmail(HONEYPOT_EMAIL)).toBeNull();
  });
});
