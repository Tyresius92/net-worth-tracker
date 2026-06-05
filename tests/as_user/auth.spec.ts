import { expect, test } from "../fixtures";

test.describe("unauthenticated access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects to login when visiting a protected route", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("logout", () => {
  test("clears the session", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);
    await page.getByRole("button", { name: "Log Out" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});
