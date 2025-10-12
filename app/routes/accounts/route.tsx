import { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { requireUser } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);

  return {};
};

export default function LinkedAccountsIndex(_props: Route.ComponentProps) {
  return (
    <Box>
      <p>Choose an account from the nav at left to see account details.</p>
    </Box>
  );
}
