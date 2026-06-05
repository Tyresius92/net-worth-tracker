import { expect, test as setup } from "@playwright/test";

import { createUser, deleteUser, saveStorageState } from "../helpers";
import { TEST_USERS } from "../test_users";

setup("authenticate as regular user", async ({ page }) => {
  await deleteUser(TEST_USERS.user.email);
  await createUser(TEST_USERS.user.email);

  await page.goto("/login");
  await page.getByLabel("Email address").fill(TEST_USERS.user.email);
  await page.getByLabel("Password").fill(TEST_USERS.user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await saveStorageState(page, TEST_USERS.user.storageState);
});
