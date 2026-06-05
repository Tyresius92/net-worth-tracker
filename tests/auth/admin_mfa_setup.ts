import { expect, test as setup } from "@playwright/test";
import { Secret, TOTP } from "otpauth";

import {
  createAdminUser,
  deleteUser,
  enableMfa,
  saveStorageState,
} from "../helpers";
import { TEST_USERS } from "../test_users";

const MFA_SECRET = "JBSWY3DPEHPK3PXP";

setup("authenticate as admin with MFA", async ({ page }) => {
  await deleteUser(TEST_USERS.adminMfa.email);
  const user = await createAdminUser(TEST_USERS.adminMfa.email);
  await enableMfa(user.id);

  await page.goto("/login");
  await page.getByLabel("Email address").fill(TEST_USERS.adminMfa.email);
  await page.getByLabel("Password").fill(TEST_USERS.adminMfa.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/login/2fa");

  const totp = new TOTP({
    issuer: "The Ledger",
    label: TEST_USERS.adminMfa.email,
    secret: Secret.fromBase32(MFA_SECRET),
  });
  await page.getByLabel("Verification Code").fill(totp.generate());
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await saveStorageState(page, TEST_USERS.adminMfa.storageState);
});
