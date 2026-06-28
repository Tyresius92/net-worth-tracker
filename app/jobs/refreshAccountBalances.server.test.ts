import { it, expect, describe } from "vitest";

import { prisma } from "~/db.server";
import { AccountFactory } from "~/factories/accountFactory";
import { PlaidAccountFactory } from "~/factories/plaidAccountFactory";
import { PlaidItemFactory } from "~/factories/plaidItemFactory";
import { UserFactory } from "~/factories/userFactory";

import { buildPlaidApiAccount, plaidMock } from "../../mocks/plaid";

import { refreshAccountBalances } from "./refreshAccountBalances.server";

// accessToken is omitted from PlaidItem query results by default (db.server.ts omit config),
// so factory creates won't include it — fetch it explicitly when needed.
async function getAccessToken(plaidItemId: string): Promise<string> {
  const { accessToken } = await prisma.plaidItem.findUniqueOrThrow({
    where: { id: plaidItemId },
    select: { accessToken: true },
  });
  return accessToken;
}

describe("refreshAccountBalances", () => {
  describe("item selection", () => {
    it("skips unhealthy items", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
        status: "unhealthy",
      });
      await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
      });

      await refreshAccountBalances();

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(0);
    });
  });

  describe("snapshot creation", () => {
    it("creates a snapshot for each account within an item", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const plaidAccount = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
      });

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(plaidAccount, { current: 1234.44 }),
      ]);

      const beforeSnapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(beforeSnapshots).toHaveLength(0);

      await refreshAccountBalances();

      const afterSnapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(afterSnapshots).toHaveLength(1);
      expect(afterSnapshots[0]?.amount).toBe(123444);
    });

    it("creates a snapshot for each account when an item has multiple accounts", async () => {
      const user = await UserFactory.createForConnect();
      const account1 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const account2 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const pa1 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account1 },
      });
      const pa2 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account2 },
      });

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(pa1, { current: 100 }),
        buildPlaidApiAccount(pa2, { current: 200 }),
      ]);

      await refreshAccountBalances();

      const snapshots1 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account1.id },
      });
      const snapshots2 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account2.id },
      });
      expect(snapshots1).toHaveLength(1);
      expect(snapshots1[0]?.amount).toBe(10000);
      expect(snapshots2).toHaveLength(1);
      expect(snapshots2[0]?.amount).toBe(20000);
    });

    it("creates snapshots for accounts across multiple items", async () => {
      const user = await UserFactory.createForConnect();
      const account1 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const account2 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const item1 = await PlaidItemFactory.create({ user: { connect: user } });
      const item2 = await PlaidItemFactory.create({ user: { connect: user } });
      const token1 = await getAccessToken(item1.id);
      const token2 = await getAccessToken(item2.id);
      const pa1 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: item1.id } },
        account: { connect: account1 },
      });
      const pa2 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: item2.id } },
        account: { connect: account2 },
      });

      plaidMock.forToken(token1, [buildPlaidApiAccount(pa1, { current: 500 })]);
      plaidMock.forToken(token2, [buildPlaidApiAccount(pa2, { current: 750 })]);

      await refreshAccountBalances();

      const snapshots1 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account1.id },
      });
      const snapshots2 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account2.id },
      });
      expect(snapshots1).toHaveLength(1);
      expect(snapshots1[0]?.amount).toBe(50000);
      expect(snapshots2).toHaveLength(1);
      expect(snapshots2[0]?.amount).toBe(75000);
    });
  });

  describe("balance normalization", () => {
    it("negates the balance for credit accounts", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const plaidAccount = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
        type: "credit",
      });

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(plaidAccount, { current: 500 }),
      ]);

      await refreshAccountBalances();

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]?.amount).toBe(-50000);
    });

    it("negates the balance for loan accounts", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const plaidAccount = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
        type: "loan",
      });

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(plaidAccount, { current: 200 }),
      ]);

      await refreshAccountBalances();

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]?.amount).toBe(-20000);
    });

    it("creates a snapshot with amount 0 when the account is not in the Plaid response", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
      });

      plaidMock.forToken(accessToken, []);

      await refreshAccountBalances();

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]?.amount).toBe(0);
    });
  });

  describe("account matching", () => {
    it("matches accounts using persistent_account_id when present", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const plaidAccount = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
      });

      plaidMock.forToken(accessToken, [
        {
          account_id: "different-id-that-should-not-match",
          persistent_account_id: plaidAccount.plaidAccountId,
          balances: {
            available: null,
            current: 999,
            limit: null,
            iso_currency_code: "USD",
            unofficial_currency_code: null,
          },
          mask: null,
          name: "Test Account",
          official_name: null,
          type: "depository",
          subtype: null,
        },
      ]);

      await refreshAccountBalances();

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]?.amount).toBe(99900);
    });
  });

  describe("single-item mode", () => {
    it("refreshes only the item matching the given plaidItemId", async () => {
      const user = await UserFactory.createForConnect();
      const account1 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const account2 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const item1 = await PlaidItemFactory.create({ user: { connect: user } });
      const item2 = await PlaidItemFactory.create({ user: { connect: user } });
      const token1 = await getAccessToken(item1.id);
      const token2 = await getAccessToken(item2.id);
      const pa1 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: item1.id } },
        account: { connect: account1 },
      });
      await PlaidAccountFactory.create({
        plaidItem: { connect: { id: item2.id } },
        account: { connect: account2 },
      });

      plaidMock.forToken(token1, [buildPlaidApiAccount(pa1, { current: 100 })]);
      plaidMock.forToken(token2, []);

      await refreshAccountBalances({ plaidItemId: item1.plaidItemId });

      const snapshots1 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account1.id },
      });
      const snapshots2 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account2.id },
      });
      expect(snapshots1).toHaveLength(1);
      expect(snapshots1[0]?.amount).toBe(10000);
      expect(snapshots2).toHaveLength(0);
    });

    it("refreshes no items when the given plaidItemId matches nothing", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const item = await PlaidItemFactory.create({ user: { connect: user } });
      await PlaidAccountFactory.create({
        plaidItem: { connect: { id: item.id } },
        account: { connect: account },
      });

      await refreshAccountBalances({
        plaidItemId: "nonexistent-plaid-item-id",
      });

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(0);
    });
  });

  describe("idempotency", () => {
    it("skips creating a snapshot when one already exists for today", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const plaidAccount = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
      });

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(plaidAccount, { current: 1000 }),
      ]);

      await refreshAccountBalances();

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(plaidAccount, { current: 9999 }),
      ]);

      await refreshAccountBalances();

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]?.amount).toBe(100000);
    });

    it("creates a snapshot for an account that has no snapshot today even when another account already has one", async () => {
      const user = await UserFactory.createForConnect();
      const account1 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const account2 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const pa1 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account1 },
      });
      const pa2 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account2 },
      });

      const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
      await prisma.balanceSnapshot.create({
        data: { accountId: account1.id, dateTime: today, amount: 50000 },
      });

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(pa1, { current: 999 }),
        buildPlaidApiAccount(pa2, { current: 200 }),
      ]);

      await refreshAccountBalances();

      const snapshots1 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account1.id },
      });
      const snapshots2 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account2.id },
      });
      expect(snapshots1).toHaveLength(1);
      expect(snapshots1[0]?.amount).toBe(50000);
      expect(snapshots2).toHaveLength(1);
      expect(snapshots2[0]?.amount).toBe(20000);
    });
  });

  describe("error handling", () => {
    it("continues processing other items when one Plaid API call fails", async () => {
      const user = await UserFactory.createForConnect();
      const account1 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const account2 = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const item1 = await PlaidItemFactory.create({ user: { connect: user } });
      const item2 = await PlaidItemFactory.create({ user: { connect: user } });
      const token1 = await getAccessToken(item1.id);
      const token2 = await getAccessToken(item2.id);
      await PlaidAccountFactory.create({
        plaidItem: { connect: { id: item1.id } },
        account: { connect: account1 },
      });
      const pa2 = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: item2.id } },
        account: { connect: account2 },
      });

      plaidMock.withItemNotFound(token1);
      plaidMock.forToken(token2, [buildPlaidApiAccount(pa2, { current: 300 })]);

      await refreshAccountBalances();

      const snapshots1 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account1.id },
      });
      const snapshots2 = await prisma.balanceSnapshot.findMany({
        where: { accountId: account2.id },
      });
      expect(snapshots1).toHaveLength(0);
      expect(snapshots2).toHaveLength(1);
      expect(snapshots2[0]?.amount).toBe(30000);
    });
  });
});
