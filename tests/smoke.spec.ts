import { expect, test } from "@playwright/test";

import { createUser, deleteUser } from "./helpers";
import { TEST_USERS } from "./test_users";

const SMOKE_EMAIL = "playwright-smoke@example.com";

test.beforeAll(async () => {
  await deleteUser(SMOKE_EMAIL);
  await createUser(SMOKE_EMAIL);
});

test.afterAll(async () => {
  await deleteUser(SMOKE_EMAIL);
});

test.describe("login", () => {
  test.describe.configure({ mode: "serial" });

  test("shows error when password is missing", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText(/Password is required/)).toBeVisible();
    await expect(page.getByLabel("Password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("shows error when password is too short", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText(/Password is too short/)).toBeVisible();
    await expect(page.getByLabel("Password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("shows error for unrecognized credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("nobody@example.com");
    await page.getByLabel("Password").fill("validpassword123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText(/Credentials not recognized/)).toBeVisible();
    await expect(page.getByLabel("Email address")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("redirects to home on successful login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(SMOKE_EMAIL);
    await page.getByLabel("Password").fill(TEST_USERS.user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
