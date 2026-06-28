import type { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { getUser, loginRedirect } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (!user) return loginRedirect(url);

  return {};
};

export default function LinkedAccountsIndex(_props: Route.ComponentProps) {
  return (
    <Box>
      <p>Choose a source from the nav at left.</p>
    </Box>
  );
}
