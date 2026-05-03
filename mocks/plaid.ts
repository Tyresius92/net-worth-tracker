import type { PlaidAccount } from "@prisma/client";
import { http, HttpResponse } from "msw";
import { ItemUpdateTypeEnum } from "plaid";

const basePlaidUrl = "https://sandbox.plaid.com";

interface PlaidApiAccountBalance {
  available: number | null;
  current: number;
  limit: number | null;
  iso_currency_code: string;
  unofficial_currency_code: string | null;
}

interface PlaidApiAccount {
  account_id: string;
  persistent_account_id: string | null;
  balances: PlaidApiAccountBalance;
  mask: string | null;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
}

interface PlaidApiError {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
}

type PlaidTokenConfig =
  | { type: "success"; accounts: PlaidApiAccount[] }
  | { type: "error"; error: PlaidApiError };

const tokenConfigs = new Map<string, PlaidTokenConfig>();

function extractAccessToken(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "access_token" in body &&
    typeof body.access_token === "string"
  ) {
    return body.access_token;
  }
  throw new Error("[plaidMock] Invalid request body: missing access_token");
}

export function buildPlaidApiAccount(
  dbAccount: Pick<
    PlaidAccount,
    "plaidAccountId" | "name" | "officialName" | "type" | "subtype" | "mask"
  >,
  overrides?: { current?: number; available?: number | null; limit?: number | null },
): PlaidApiAccount {
  return {
    account_id: dbAccount.plaidAccountId,
    persistent_account_id: null,
    balances: {
      available: overrides?.available ?? null,
      current: overrides?.current ?? 0,
      limit: overrides?.limit ?? null,
      iso_currency_code: "USD",
      unofficial_currency_code: null,
    },
    mask: dbAccount.mask,
    name: dbAccount.name,
    official_name: dbAccount.officialName,
    type: dbAccount.type,
    subtype: dbAccount.subtype ?? null,
  };
}

export const plaidMock = {
  forToken: (accessToken: string, accounts: PlaidApiAccount[]) => {
    tokenConfigs.set(accessToken, { type: "success", accounts });
  },
  withItemNotFound: (accessToken: string) => {
    tokenConfigs.set(accessToken, {
      type: "error",
      error: {
        error_type: "ITEM_ERROR",
        error_code: "ITEM_NOT_FOUND",
        error_message: "the provided access token is not valid",
        display_message: null,
      },
    });
  },
  withExpiredToken: (accessToken: string) => {
    tokenConfigs.set(accessToken, {
      type: "error",
      error: {
        error_type: "ITEM_ERROR",
        error_code: "ITEM_LOGIN_REQUIRED",
        error_message: "the login details of this item have changed",
        display_message: "Please reconnect your account",
      },
    });
  },
  reset: () => tokenConfigs.clear(),
};

export const plaidHandlers = [
  http.post(`${basePlaidUrl}/accounts/get`, async ({ request }) => {
    const accessToken = extractAccessToken(await request.json());
    const config = tokenConfigs.get(accessToken);

    if (!config) {
      throw new Error(
        `[plaidMock] No mock configured for access_token "${accessToken}". ` +
          `Call plaidMock.forToken() or plaidMock.withItemNotFound() in your test.`,
      );
    }

    if (config.type === "error") {
      return HttpResponse.json({ error: config.error }, { status: 400 });
    }

    return HttpResponse.json({
      accounts: config.accounts,
      item: {
        item_id: "item-id",
        webhook: null,
        error: null,
        available_products: [],
        billed_products: [],
        consent_expiration_time: null,
        update_type: ItemUpdateTypeEnum.Background,
      },
      request_id: "req-test-1",
    });
  }),
];
