import { expect, test } from "../fixtures";
import { createUser, deleteUser } from "../helpers";

test("shows 2FA, Sources, Closed, and Verified At column headers", async ({
  page,
}) => {
  await page.goto("/users");
  await expect(page.getByRole("columnheader", { name: "2FA" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Sources" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Closed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Verified At" }),
  ).toBeVisible();
});

test("shows a verification date for the admin user", async ({
  page,
  testUser,
}) => {
  await page.goto("/users");
  const row = page.getByRole("row", { name: new RegExp(testUser.email) });
  await expect(
    row.getByRole("cell", { name: /\w+ \d+, \d{4}/ }).first(),
  ).toBeVisible();
});

test("shows email verified date on user detail page", async ({
  page,
  testUser,
}) => {
  await page.goto("/users");
  await page
    .getByRole("row", { name: new RegExp(testUser.email) })
    .getByRole("link")
    .first()
    .click();

  await expect(page.getByText("Email verified")).toBeVisible();
  await expect(page.getByText(/\w+ \d+, \d{4}/).first()).toBeVisible();
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

test("shows Promote to admin button on a customer detail page", async ({
  page,
}) => {
  const email = "playwright-promote-visible@example.com";
  await deleteUser(email);
  await createUser(email);

  try {
    await page.goto("/users");
    await page
      .getByRole("row", { name: new RegExp(email) })
      .getByRole("link")
      .first()
      .click();

    await expect(
      page.getByRole("button", { name: "Promote to admin" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Promote to admin" }),
    ).toBeEnabled();
  } finally {
    await deleteUser(email);
  }
});

test("can promote a customer to admin and then revoke", async ({ page }) => {
  const email = "playwright-promote-toggle@example.com";
  await deleteUser(email);
  await createUser(email);

  try {
    await page.goto("/users");
    await page
      .getByRole("row", { name: new RegExp(email) })
      .getByRole("link")
      .first()
      .click();

    await page.getByRole("button", { name: "Promote to admin" }).click();
    await expect(
      page.getByRole("button", { name: "Revoke admin" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Revoke admin" }).click();
    await expect(
      page.getByRole("button", { name: "Promote to admin" }),
    ).toBeVisible();
  } finally {
    await deleteUser(email);
  }
});

test("disables Revoke admin button on the logged-in admin's own detail page", async ({
  page,
  testUser,
}) => {
  await page.goto("/users");
  await page
    .getByRole("row", { name: new RegExp(testUser.email) })
    .getByRole("link")
    .first()
    .click();

  await expect(
    page.getByRole("button", { name: "Revoke admin" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Revoke admin" }),
  ).toBeDisabled();
});
