import { PrismaClient } from "@prisma/client";

import { expect, test } from "../fixtures";

const prisma = new PrismaClient();

test.describe("check the wire button", () => {
  test("is visible on a wire service source", async ({
    page,
    withPlaidAccount,
  }) => {
    const account = await withPlaidAccount();
    await page.goto(`/accounts/${account.id}`);

    await expect(
      page.getByRole("button", { name: "Check the wire" }),
    ).toBeVisible();
  });

  test("is not visible on a staff-reported source", async ({
    page,
    withAccount,
  }) => {
    const account = await withAccount();
    await page.goto(`/accounts/${account.id}`);

    await expect(
      page.getByRole("button", { name: "Check the wire" }),
    ).toBeHidden();
  });

  test("is disabled with hint text when today's figures exist", async ({
    page,
    withPlaidAccount,
  }) => {
    const account = await withPlaidAccount();
    const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
    await prisma.balanceSnapshot.create({
      data: { accountId: account.id, dateTime: today, amount: 100000 },
    });

    try {
      await page.goto(`/accounts/${account.id}`);

      await expect(
        page.getByRole("button", { name: "Check the wire" }),
      ).toBeDisabled();
      await expect(
        page.getByText("Today's figures have already been filed."),
      ).toBeVisible();
    } finally {
      await prisma.balanceSnapshot.deleteMany({
        where: { accountId: account.id },
      });
    }
  });
});
