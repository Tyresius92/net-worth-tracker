import { faker } from "@faker-js/faker";
import type { Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { TEST_USERS } from "./test_users";

const prisma = new PrismaClient();

export async function createUser(email: string) {
  const hash = await bcrypt.hash(TEST_USERS.user.password, 10);
  return prisma.user.create({
    data: {
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      emailVerifiedAt: new Date(),
      password: { create: { hash } },
    },
  });
}

export async function createAdminUser(email: string) {
  const hash = await bcrypt.hash(TEST_USERS.admin.password, 10);
  return prisma.user.create({
    data: {
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      emailVerifiedAt: new Date(),
      role: "admin",
      password: { create: { hash } },
    },
  });
}

export async function enableMfa(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
    },
  });
}

export async function deleteUser(email: string) {
  try {
    await prisma.user.delete({ where: { email } });
  } catch {
    // user may already be gone
  }
}

// Saves browser storageState with the Secure flag stripped from all cookies.
// react-router-serve runs with NODE_ENV=production, which sets Secure on the
// session cookie. Firefox does not send programmatically-loaded Secure cookies
// over HTTP even for localhost, so we strip the flag before saving.
export async function saveStorageState(page: Page, path: string) {
  const context = page.context();
  const cookies = await context.cookies();
  await context.clearCookies();
  await context.addCookies(cookies.map((c) => ({ ...c, secure: false })));
  await context.storageState({ path });
}
