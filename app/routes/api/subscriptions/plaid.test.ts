import { assert, describe, expect, it, vi } from "vitest";

import { prisma } from "~/db.server";
import { AccountFactory } from "~/factories/accountFactory";
import { PlaidAccountFactory } from "~/factories/plaidAccountFactory";
import { PlaidItemFactory } from "~/factories/plaidItemFactory";
import { UserFactory } from "~/factories/userFactory";

import { buildPlaidApiAccount, plaidMock } from "../../../../mocks/plaid";

import { action } from "./plaid";

vi.mock("~/utils/plaidWebhookVerification.server", () => ({
  verifyPlaidWebhook: vi.fn().mockResolvedValue(true),
}));

const { verifyPlaidWebhook } =
  await import("~/utils/plaidWebhookVerification.server");

async function getAccessToken(plaidItemId: string): Promise<string> {
  const { accessToken } = await prisma.plaidItem.findUniqueOrThrow({
    where: { id: plaidItemId },
    select: { accessToken: true },
  });
  return accessToken;
}

const makeRequest = (body: object) =>
  new Request("https://app.test/api/subscriptions/plaid", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Plaid-Verification": "mock-token",
    },
    body: JSON.stringify(body),
  });

const callAction = async (body: object): Promise<Response> => {
  const result = await action({
    request: makeRequest(body),
    params: {},
    context: {},
    url: new URL("https://app.test/api/subscriptions/plaid"),
    pattern: "/api/subscriptions/plaid",
  });
  assert(result instanceof Response, "action must return a Response");
  return result;
};

describe("POST /api/subscriptions/plaid", () => {
  describe("signature verification", () => {
    it("returns 401 and makes no DB changes when verification fails", async () => {
      vi.mocked(verifyPlaidWebhook).mockResolvedValueOnce(false);

      const user = await UserFactory.createForConnect();
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
        status: "healthy",
      });

      const response = await callAction({
        webhook_type: "ITEM",
        webhook_code: "ERROR",
        item_id: plaidItem.plaidItemId,
      });

      expect(response.status).toBe(401);

      const { status } = await prisma.plaidItem.findUniqueOrThrow({
        where: { id: plaidItem.id },
        select: { status: true },
      });
      expect(status).toBe("healthy");
    });
  });

  describe("TRANSACTIONS refresh trigger codes", () => {
    it.each([
      ["SYNC_UPDATES_AVAILABLE"],
      ["DEFAULT_UPDATE"],
      ["INITIAL_UPDATE"],
      ["HISTORICAL_UPDATE"],
    ])(
      "refreshes balances for the identified item on webhook_code %s",
      async (code) => {
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

        const response = await callAction({
          webhook_type: "TRANSACTIONS",
          webhook_code: code,
          item_id: plaidItem.plaidItemId,
        });

        expect(response.status).toBe(200);

        const snapshots = await prisma.balanceSnapshot.findMany({
          where: { accountId: account.id },
        });
        expect(snapshots).toHaveLength(1);
        expect(snapshots[0].amount).toBe(100000);
      },
    );
  });

  describe("ITEM error codes", () => {
    it.each([
      ["ERROR"],
      ["PENDING_EXPIRATION"],
      ["PENDING_DISCONNECT"],
      ["USER_PERMISSION_REVOKED"],
      ["USER_ACCOUNT_REVOKED"],
    ])("marks the PlaidItem unhealthy for webhook_code %s", async (code) => {
      const user = await UserFactory.createForConnect();
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
        status: "healthy",
      });

      const response = await callAction({
        webhook_type: "ITEM",
        webhook_code: code,
        item_id: plaidItem.plaidItemId,
      });

      expect(response.status).toBe(200);

      const { status } = await prisma.plaidItem.findUniqueOrThrow({
        where: { id: plaidItem.id },
        select: { status: true },
      });
      expect(status).toBe("unhealthy");
    });
  });

  describe("ITEM.LOGIN_REPAIRED", () => {
    it("marks the PlaidItem healthy and refreshes balances", async () => {
      const user = await UserFactory.createForConnect();
      const account = await AccountFactory.createForConnect({
        user: { connect: user },
      });
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
        status: "unhealthy",
      });
      const accessToken = await getAccessToken(plaidItem.id);
      const plaidAccount = await PlaidAccountFactory.create({
        plaidItem: { connect: { id: plaidItem.id } },
        account: { connect: account },
      });

      plaidMock.forToken(accessToken, [
        buildPlaidApiAccount(plaidAccount, { current: 500 }),
      ]);

      const response = await callAction({
        webhook_type: "ITEM",
        webhook_code: "LOGIN_REPAIRED",
        item_id: plaidItem.plaidItemId,
      });

      expect(response.status).toBe(200);

      const { status } = await prisma.plaidItem.findUniqueOrThrow({
        where: { id: plaidItem.id },
        select: { status: true },
      });
      expect(status).toBe("healthy");

      const snapshots = await prisma.balanceSnapshot.findMany({
        where: { accountId: account.id },
      });
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].amount).toBe(50000);
    });
  });

  describe("unknown codes", () => {
    it("returns 200 and makes no DB changes for an unrecognized webhook", async () => {
      const user = await UserFactory.createForConnect();
      const plaidItem = await PlaidItemFactory.create({
        user: { connect: user },
        status: "healthy",
      });

      const response = await callAction({
        webhook_type: "TRANSACTIONS",
        webhook_code: "UNKNOWN_FUTURE_CODE",
        item_id: plaidItem.plaidItemId,
      });

      expect(response.status).toBe(200);

      const { status } = await prisma.plaidItem.findUniqueOrThrow({
        where: { id: plaidItem.id },
        select: { status: true },
      });
      expect(status).toBe("healthy");
    });
  });
});
