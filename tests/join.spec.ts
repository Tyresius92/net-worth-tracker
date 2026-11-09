import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// The join action is rate limited to 5 submissions per IP per 15 minutes,
// so keep the total number of submissions in this file at 5 or fewer.

const fillJoinForm = async (
  page: Page,
  { firstName, lastName }: { firstName: string; lastName: string },
) => {
  await page.goto("/join");
  await page.getByLabel("Email address").fill("join-spec@example.com");
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Apply" }).click();
};

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
});
