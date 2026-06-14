import { expect, test } from "../fixtures";

test("shows the admin bar with correct links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Contact messages" }),
  ).toBeVisible();
});
