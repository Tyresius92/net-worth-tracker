import { CountryCode, Products } from "plaid";
import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useFetcher,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { plaidClient } from "~/plaid";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const foo = await plaidClient.linkTokenCreate({
    user: {
      client_user_id: userId,
    },
    client_name: "Money Chomp",
    products: [Products.Transactions],
    language: "en",
    country_codes: [CountryCode.Us],
  });

  return {
    linkToken: foo.data.link_token,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const token = formData.get("public_token");

  if (!token || typeof token !== 'string') {
    // error state or something
    return {}
  }

  const tokenExchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: token
  })

  const plaidItemId = tokenExchangeResponse.data.item_id
  const accessToken = tokenExchangeResponse.data.access_token

  const plaidItem = await prisma.plaidItem.create({
    data: {
      userId,
      plaidItemId,
      accessToken
    },
    include: {
      user: true
    }
  })

  return {
    plaidItem
  }
};

export default function NewPlaidItemRoute({
  loaderData,
  actionData
}: Route.ComponentProps) {
  const fetcher = useFetcher();

  const { ready, open } = usePlaidLink({
    onSuccess(publicToken, metadata) {
      console.log('asdf metadata', {
        metadata
      })

      const formData = new FormData();

      formData.append("public_token", publicToken);

      fetcher.submit(formData, {
        method: "post",
      });
    },
    token: loaderData.linkToken,
  });

  useEffect(() => {
    if (ready && !actionData) {
      open();
    }
  }, [ready, open, actionData]);

  return (
    <Box>

    </Box>
  );
}
