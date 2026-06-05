import { expect, test as setup } from "@playwright/test";

import { createAdminUser, deleteUser, saveStorageState } from "../helpers";
import { TEST_USERS } from "../test_users";

setup("authenticate as admin", async ({ page }) => {
  await deleteUser(TEST_USERS.admin.email);
  await createAdminUser(TEST_USERS.admin.email);

  await page.goto("/login");
  await page.getByLabel("Email address").fill(TEST_USERS.admin.email);
  await page.getByLabel("Password").fill(TEST_USERS.admin.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await saveStorageState(page, TEST_USERS.admin.storageState);
});
