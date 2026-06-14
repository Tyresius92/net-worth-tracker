import { expect, test } from "../fixtures";

test("shows 2FA, Sources, and Closed column headers", async ({ page }) => {
  await page.goto("/users");
  await expect(page.getByRole("columnheader", { name: "2FA" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Sources" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Closed" }),
  ).toBeVisible();
});

test("shows Disabled and no sources for admin user with no accounts", async ({
  page,
  testUser,
}) => {
  await page.goto("/users");
  const row = page.getByRole("row", { name: new RegExp(testUser.email) });
  await expect(row.getByRole("cell", { name: "Disabled" })).toBeVisible();
  await expect(row.getByRole("cell", { name: "—" }).first()).toBeVisible();
});

test("shows source counts after adding an account", async ({
  page,
  testUser,
  withAccount,
}) => {
  await withAccount("Test Checking");
  await page.goto("/users");
  const row = page.getByRole("row", { name: new RegExp(testUser.email) });
  await expect(
    row.getByRole("cell", { name: "1 — 0 wire · 1 staff-reported" }),
  ).toBeVisible();
});
