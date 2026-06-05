import { test as base } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

import { TEST_USERS } from "./test_users";

const prisma = new PrismaClient();

const PROJECT_USER_MAP = {
  "as-user": TEST_USERS.user,
  "as-user-mfa": TEST_USERS.userMfa,
  "as-admin": TEST_USERS.admin,
  "as-admin-mfa": TEST_USERS.adminMfa,
} as const;

type ProjectName = keyof typeof PROJECT_USER_MAP;

const isProjectName = (name: string): name is ProjectName =>
  name in PROJECT_USER_MAP;

interface Fixtures {
  testUser: (typeof TEST_USERS)[keyof typeof TEST_USERS];
  withAccount: (name?: string) => Promise<{ id: string; name: string }>;
}

export const test = base.extend<Fixtures>({
  testUser: async (
    // eslint-disable-next-line no-empty-pattern
    {
      // intentionally empty
    },
    provide,
    testInfo,
  ) => {
    const projectName = testInfo.project.name;
    if (!isProjectName(projectName)) {
      throw new Error(
        `testUser fixture is not available in the "${projectName}" project`,
      );
    }
    await provide(PROJECT_USER_MAP[projectName]);
  },

  withAccount: async ({ testUser }, provide) => {
    const created: string[] = [];

    await provide(async (name = "Test Source") => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: testUser.email },
        select: { id: true },
      });
      const account = await prisma.account.create({
        data: { customName: name, type: "checking", userId: user.id },
      });
      created.push(account.id);
      return { id: account.id, name: account.customName ?? name };
    });

    await prisma.account.deleteMany({ where: { id: { in: created } } });
  },
});

export { expect } from "@playwright/test";
