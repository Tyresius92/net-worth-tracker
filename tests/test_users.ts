export const TEST_USERS = {
  user: {
    email: "playwright-user@example.com",
    password: "playwright-test-password",
    storageState: "tests/.auth/user.json",
  },
  userMfa: {
    email: "playwright-user-mfa@example.com",
    password: "playwright-test-password",
    storageState: "tests/.auth/user_mfa.json",
  },
  admin: {
    email: "playwright-admin@example.com",
    password: "playwright-test-password",
    storageState: "tests/.auth/admin.json",
  },
  adminMfa: {
    email: "playwright-admin-mfa@example.com",
    password: "playwright-test-password",
    storageState: "tests/.auth/admin_mfa.json",
  },
} as const;
