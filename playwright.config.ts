import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test", override: true });

const PORT = 8811;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["dot"], ["html", { open: "never" }]] : "html",
  globalSetup: "./tests/global_setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    // --- Setup: create users and save auth state to tests/.auth/ ---
    // Must use the same browser as the test projects so Secure cookies are
    // captured and replayed consistently — Firefox does not apply the localhost
    // exemption for Secure cookies when loading storageState saved by Chromium.
    {
      name: "setup-user",
      testMatch: "auth/user_setup.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "setup-user-mfa",
      testMatch: "auth/user_mfa_setup.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "setup-admin",
      testMatch: "auth/admin_setup.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "setup-admin-mfa",
      testMatch: "auth/admin_mfa_setup.ts",
      use: { ...devices["Desktop Firefox"] },
    },

    // --- Unauthenticated: root-level spec files, no stored session ---
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /[/]tests[/][^/]+\.spec\.ts$/,
    },

    // --- Authenticated: one subdirectory per role ---
    {
      name: "as-user",
      dependencies: ["setup-user"],
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/.auth/user.json",
      },
      testMatch: "as_user/**/*.spec.ts",
    },
    {
      name: "as-user-mfa",
      dependencies: ["setup-user-mfa"],
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/.auth/user_mfa.json",
      },
      testMatch: "as_user_mfa/**/*.spec.ts",
    },
    {
      name: "as-admin",
      dependencies: ["setup-admin"],
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/.auth/admin.json",
      },
      testMatch: "as_admin/**/*.spec.ts",
    },
    {
      name: "as-admin-mfa",
      dependencies: ["setup-admin-mfa"],
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/.auth/admin_mfa.json",
      },
      testMatch: "as_admin_mfa/**/*.spec.ts",
    },
  ],
  webServer: {
    command: `cross-env PORT=${PORT} npm run start:mocks`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "",
      PRISMA_FIELD_ENCRYPTION_KEY:
        process.env.PRISMA_FIELD_ENCRYPTION_KEY ?? "",
      PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID ?? "",
      PLAID_SECRET: process.env.PLAID_SECRET ?? "",
      PLAID_ENV: process.env.PLAID_ENV ?? "",
    },
  },
});
