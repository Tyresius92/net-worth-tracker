import { faker } from "@faker-js/faker";
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
  withPlaidAccount: (name?: string) => Promise<{ id: string; name: string }>;
}

export const test = base.extend<Fixtures>({
  testUser: async (
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

  withPlaidAccount: async ({ testUser }, provide) => {
    const createdAccountIds: string[] = [];
    const createdPlaidItemIds: string[] = [];

    await provide(async (name = "Test Wire Source") => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: testUser.email },
        select: { id: true },
      });
      const account = await prisma.account.create({
        data: { customName: name, type: "checking", userId: user.id },
      });
      const plaidItem = await prisma.plaidItem.create({
        data: {
          userId: user.id,
          status: "healthy",
          plaidItemId: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          institutionId: faker.string.uuid(),
          institutionName: faker.company.name(),
        },
      });
      await prisma.plaidAccount.create({
        data: {
          plaidItemId: plaidItem.id,
          accountId: account.id,
          plaidAccountId: faker.string.uuid(),
          name: faker.finance.accountName(),
          officialName: faker.finance.accountName(),
          type: "depository",
          mask: faker.string.numeric(4),
        },
      });
      createdAccountIds.push(account.id);
      createdPlaidItemIds.push(plaidItem.id);
      return { id: account.id, name: account.customName ?? name };
    });

    await prisma.plaidAccount.deleteMany({
      where: { plaidItemId: { in: createdPlaidItemIds } },
    });
    await prisma.plaidItem.deleteMany({
      where: { id: { in: createdPlaidItemIds } },
    });
    await prisma.account.deleteMany({
      where: { id: { in: createdAccountIds } },
    });
  },
});

export { expect } from "@playwright/test";
