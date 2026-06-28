import { CountryCode, Products } from "plaid";
import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs} from "react-router";
import {
  redirect,
  useFetcher,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { logger } from "~/logger";
import { plaidClient } from "~/plaid";
import { requireUserId } from "~/session.server";
import { getAccountType } from "~/utils/accountUtils.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request, url);

  const linkTokenResponse = await plaidClient.linkTokenCreate({
    user: {
      client_user_id: userId,
    },
    client_name: "The Ledger",
    products: [Products.Transactions],
    language: "en",
    country_codes: [CountryCode.Us],
    webhook: `${process.env.APP_URL}/api/subscriptions/plaid`,
  });

  return {
    linkToken: linkTokenResponse.data.link_token,
  };
};

export const action = async ({ request, url }: ActionFunctionArgs) => {
  const userId = await requireUserId(request, url);

  const formData = await request.formData();
  const token = formData.get("public_token");
  const institutionId = formData.get("institution_id");
  const institutionName = formData.get("institution_name");

  if (!token || typeof token !== "string") {
    // error state or something
    return {};
  }

  if (!institutionId || typeof institutionId !== "string") {
    // error state or something
    return {};
  }

  if (!institutionName || typeof institutionName !== "string") {
    // error state or something
    return {};
  }

  const tokenExchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: token,
  });

  const plaidItemId = tokenExchangeResponse.data.item_id;
  const accessToken = tokenExchangeResponse.data.access_token;

  const plaidItem = await prisma.plaidItem.create({
    data: {
      userId,
      plaidItemId,
      accessToken,
      status: "healthy",
      institutionId,
      institutionName,
    },
    include: {
      user: true,
    },
  });

  const response = await plaidClient.accountsGet({
    access_token: accessToken,
  });

  const plaidAccounts = response.data.accounts;

  for await (const plaidAccountObj of plaidAccounts) {
    const account = await prisma.account.create({
      data: {
        userId,
        customName: plaidAccountObj.official_name,
        type: getAccountType(plaidAccountObj),
      },
    });

    const currentBalanceDollars = plaidAccountObj.balances.current ?? 0;
    const currentBalance = Math.floor(currentBalanceDollars * 100);

    const _balanceSnap = await prisma.balanceSnapshot.create({
      data: {
        amount: ["loan", "credit"].includes(plaidAccountObj.type)
          ? currentBalance * -1
          : currentBalance,
        dateTime: new Date(),
        accountId: account.id,
      },
    });

    const _plaidAccount = await prisma.plaidAccount.create({
      data: {
        plaidItemId: plaidItem.id,
        accountId: account.id,
        plaidAccountId: plaidAccountObj.account_id,
        officialName: plaidAccountObj.official_name ?? plaidAccountObj.name,
        name: plaidAccountObj.name,
        mask: plaidAccountObj.mask ?? "",
        type: plaidAccountObj.type,
        subtype: plaidAccountObj.subtype,
      },
    });
  }

  return redirect("./../..");
};

export default function NewPlaidItemRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const fetcher = useFetcher();

  const { ready, open } = usePlaidLink({
    onSuccess(publicToken, metadata) {
      const formData = new FormData();

      formData.append("public_token", publicToken);
      if (metadata.institution) {
        formData.append("institution_id", metadata.institution.institution_id);
        formData.append("institution_name", metadata.institution.name);
      }

      fetcher.submit(formData, {
        method: "post",
      });
    },
    onExit(err, metadata) {
      if (err) {
        logger.warn("Plaid Link exited with error", {
          errorCode: err.error_code,
          errorType: err.error_type,
          errorMessage: err.error_message,
          status: metadata.status,
        });
      }
    },
    token: loaderData.linkToken,
  });

  useEffect(() => {
    if (ready && !actionData) {
      open();
    }
  }, [ready, open, actionData]);

  return <Box></Box>;
}
