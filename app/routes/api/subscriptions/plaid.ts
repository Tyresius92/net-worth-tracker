import { ActionFunction } from "react-router";

import { prisma } from "~/db.server";
import { refreshAccountBalances } from "~/jobs/refreshAccountBalances.server";
import { verifyPlaidWebhook } from "~/utils/plaidWebhookVerification.server";

interface WebhookPayload {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
}

const isWebhookPayload = (value: unknown): value is WebhookPayload =>
  typeof value === "object" &&
  value !== null &&
  "webhook_type" in value &&
  typeof value.webhook_type === "string" &&
  "webhook_code" in value &&
  typeof value.webhook_code === "string" &&
  "item_id" in value &&
  typeof value.item_id === "string";

const REFRESH_TRIGGER_CODES = [
  "SYNC_UPDATES_AVAILABLE",
  "DEFAULT_UPDATE",
  "INITIAL_UPDATE",
  "HISTORICAL_UPDATE",
];

const UNHEALTHY_ITEM_CODES = [
  "ERROR",
  "PENDING_EXPIRATION",
  "PENDING_DISCONNECT",
  "USER_PERMISSION_REVOKED",
  "USER_ACCOUNT_REVOKED",
];

export const action: ActionFunction = async ({ request }) => {
  const rawBody = await request.text();
  const token = request.headers.get("Plaid-Verification") ?? "";

  const isValid = await verifyPlaidWebhook(rawBody, token);
  if (!isValid) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body: unknown = JSON.parse(rawBody);

  if (!isWebhookPayload(body)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { webhook_type, webhook_code, item_id } = body;

  if (
    webhook_type === "TRANSACTIONS" &&
    REFRESH_TRIGGER_CODES.includes(webhook_code)
  ) {
    await refreshAccountBalances({ plaidItemId: item_id });
  } else if (
    webhook_type === "ITEM" &&
    UNHEALTHY_ITEM_CODES.includes(webhook_code)
  ) {
    await prisma.plaidItem.updateMany({
      where: { plaidItemId: item_id },
      data: { status: "unhealthy" },
    });
  } else if (webhook_type === "ITEM" && webhook_code === "LOGIN_REPAIRED") {
    await prisma.plaidItem.updateMany({
      where: { plaidItemId: item_id },
      data: { status: "healthy" },
    });
    await refreshAccountBalances({ plaidItemId: item_id });
  }

  return Response.json({ ok: true });
};
