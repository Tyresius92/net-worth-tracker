import { } from "@prisma/client";
import { CountryCode } from "plaid";
import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import {
  LoaderFunctionArgs,
  useFetcher,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { plaidClient } from "~/plaid";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

// TODO: Move this over to a separate "update" route that gets called on mount or something?
// Tbh, this whole flow is whack
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const plaidItem = await prisma.plaidItem.findFirstOrThrow({
    where: {
      id: params.itemId,
    },
    select: {
      accessToken: true,
    },
  });

  const linkTokenResponse = await plaidClient.linkTokenCreate({
    user: {
      client_user_id: userId,
    },
    client_name: "Money Chomp",
    access_token: plaidItem.accessToken,
    language: "en",
    country_codes: [CountryCode.Us],
  });

  return {
    linkToken: linkTokenResponse.data.link_token,
  };
};

export default function PlaidItemDetailsRoute({
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
    token: loaderData.linkToken,
  });

  useEffect(() => {
    if (ready && !actionData) {
      open();
    }
  }, [ready, open, actionData]);

  return <Box>Plaid Item Details Route</Box>;
}
