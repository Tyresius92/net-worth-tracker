import { expect, test } from "../fixtures";

test("does not show the admin bar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Admin" })).toBeHidden();
});
