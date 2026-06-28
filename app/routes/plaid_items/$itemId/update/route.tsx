import { CountryCode } from "plaid";
import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useFetcher } from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { logger } from "~/logger";
import { plaidClient } from "~/plaid";
import { getUserId, loginRedirect } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, url, params }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);

  const plaidItem = await prisma.plaidItem.findFirstOrThrow({
    where: {
      id: params.itemId,
      userId,
    },
    select: {
      accessToken: true,
    },
  });

  const linkTokenResponse = await plaidClient.linkTokenCreate({
    user: {
      client_user_id: userId,
    },
    client_name: "The Ledger",
    access_token: plaidItem.accessToken,
    language: "en",
    country_codes: [CountryCode.Us],
    webhook: `${process.env.APP_URL}/api/subscriptions/plaid`,
  });

  return {
    linkToken: linkTokenResponse.data.link_token,
  };
};

export const action = async ({ params, request, url }: ActionFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);

  await prisma.plaidItem.updateMany({
    where: { id: params.itemId, userId },
    data: { status: "healthy" },
  });

  return redirect("..");
};

export default function PlaidItemRepairRoute({
  loaderData,
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

      void fetcher.submit(formData, {
        method: "post",
      });
    },
    onExit(err, metadata) {
      if (err) {
        logger.warn("Plaid Link exited with error during repair", {
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
    if (ready) {
      // Plaid wrote funky types here, so just silence it instead of
      // trying to work around the external dependency
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      open();
    }
  }, [ready, open]);

  return <Box></Box>;
}
